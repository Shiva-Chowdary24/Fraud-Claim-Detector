from fastapi import APIRouter, HTTPException, Header
from database import (
    policy_requests,
    issued_policies,
    notifications,
    audit_logs,
    queries,
    fraud_logs,
    policies
)
from datetime import datetime, timezone
from bson import ObjectId
import random
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# =========================================================
# Helpers
# =========================================================

def now():
    return datetime.utcnow()


def verify_admin(role: str):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required.")


def log_admin_action(admin_email: str, action: str, details: str):
    audit_logs.insert_one({
        "admin": admin_email,
        "action": action,
        "details": details,
        "timestamp": datetime.utcnow()
    })


# =========================================================
# ADMIN: AVAILABLE POLICIES
# =========================================================
@router.get("/admin/available-policies")
def get_available_policies(role: str = Header(None)):
    verify_admin(role)

    policies_list = list(policies.find())

    for p in policies_list:
        p["_id"] = str(p["_id"])

        p["plan_name"] = p.get("plan_name", "")
        p["plan_type"] = p.get("plan_type", "")
        p["description"] = p.get("description", "")
        p["benefits"] = p.get("benefits", "")

        p["premium_amount"] = p.get("premium_amount", 0)
        p["total_claim_amount"] = p.get("total_claim_amount", 0)
        p["tenure"] = p.get("tenure", 0)

        # Policy mode: NORMAL | HG
        p["policy_mode"] = p.get("policy_mode", "NORMAL")

        # Growth (Dividend synonym) fields
        p["dividend_rate"] = p.get("dividend_rate", None)
        p["dividend_reinvestment"] = p.get("dividend_reinvestment", False)

    return policies_list


# =========================================================
# ADMIN: POLICY REQUESTS
# =========================================================
@router.get("/admin/policy-requests")
def get_requests(role: str = Header(None)):
    verify_admin(role)

    results = list(policy_requests.find({"status": "Pending"}))
    for r in results:
        r["_id"] = str(r["_id"])

    return results


# =========================================================
# ADMIN: APPROVE POLICY REQUEST
# =========================================================
@router.post("/admin/policy-approve/{request_id}")
def approve_policy(request_id: str, role: str = Header(None)):
    verify_admin(role)

    try:
        req = policy_requests.find_one({"_id": ObjectId(request_id)})
        if not req:
            raise HTTPException(status_code=404, detail="Application not found")

        policy_master = policies.find_one(
            {"plan_name": req.get("plan_name")}
        )
        if not policy_master:
            raise HTTPException(status_code=404, detail="Policy not found in master collection")

        plan_name = req.get("plan_name", "POL")
        policy_code = plan_name[:3].upper()
        generated_id = f"PL-{policy_code}-{random.randint(1000, 9999)}"

        issued_data = {
            "policy_id": generated_id,
            "customer_id": req.get("customer_id"),
            "email": req.get("email"),
            "plan_name": plan_name,
            "plan_type": policy_master.get("plan_type"),
            "premium_amount": policy_master.get("premium_amount"),
            "total_claim_amount": policy_master.get("total_claim_amount"),
            "tenure": policy_master.get("tenure"),
            "description": policy_master.get("description"),
            "benefits": policy_master.get("benefits"),

            # ✅ Carry over HG / NORMAL data
            "policy_mode": policy_master.get("policy_mode", "NORMAL"),
            "dividend_rate": policy_master.get("dividend_rate", 0),
            "dividend_reinvestment": policy_master.get("dividend_reinvestment", False),

            "status": "Active",
            "approved_at": now()
        }

        issued_policies.insert_one(issued_data)
        policy_requests.delete_one({"_id": ObjectId(request_id)})

        notifications.insert_one({
            "recipient_id": str(req.get("customer_id")),
            "message": f"Policy '{plan_name}' has been issued successfully.",
            "link": "/customer/issued-policies",
            "type": "policy_approved",
            "timestamp": now(),
            "read": False
        })

        log_admin_action(
            "admin1@gmail.com",
            "POLICY_ISSUED",
            f"Issued policy {plan_name} to customer {req.get('customer_id')}"
        )

        return {
            "message": "Approved",
            "policy_id": generated_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# ADMIN: DECLINE POLICY REQUEST
# =========================================================
@router.post("/admin/policy-decline/{request_id}")
def decline_policy(request_id: str, role: str = Header(None)):
    verify_admin(role)

    try:
        req = policy_requests.find_one({"_id": ObjectId(request_id)})
        if not req:
            raise HTTPException(status_code=404, detail="Application not found")

        customer_id = req.get("customer_id")
        plan_name = req.get("plan_name", "Insurance Plan")
        policy_mode = req.get("policy_mode", "NORMAL")

        mode_text = " (HG Plan)" if policy_mode == "HG" else ""

        notifications.insert_one({
            "recipient_id": str(customer_id),
            "message": (
                f"Your request for '{plan_name}'{mode_text} was declined after review. "
                "Please contact support for more details."
            ),
            "link": "/customer/ask-question",
            "type": "policy_declined",
            "timestamp": now(),
            "read": False
        })

        log_admin_action(
            "admin1@gmail.com",
            "POLICY_DECLINED",
            f"Declined {policy_mode} policy {plan_name} for customer {customer_id}"
        )

        policy_requests.delete_one({"_id": ObjectId(request_id)})

        return {
            "status": "success",
            "message": "Policy request declined and customer notified"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# ADMIN: AUDIT LOGS
# =========================================================
@router.get("/admin/audit-logs")
def get_audit_logs(role: str = Header(None)):
    verify_admin(role)
    return list(audit_logs.find({}, {"_id": 0}).sort("timestamp", -1))


# =========================================================
# ADMIN: FRAUD LOGS
# =========================================================
@router.get("/admin/logs")
def get_fraud_logs(role: str = Header(None)):
    verify_admin(role)

    logs = list(fraud_logs.find({}))
    for log in logs:
        log["_id"] = str(log["_id"])
        log["Policy_id"] = log.get("Policy_id") or log.get("policy_id")

    def sort_key(x):
        verified = x.get("verified", False)
        ts = x.get("timestamp")

        if isinstance(ts, datetime):
            dt = ts
        elif isinstance(ts, str):
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except:
                dt = datetime.min
        else:
            dt = datetime.min

        if dt.tzinfo:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)

        return (verified, dt)

    return sorted(logs, key=sort_key, reverse=True)


# =========================================================
# ADMIN: NOTIFICATIONS
# =========================================================
@router.get("/admin/notifications")
def get_admin_notifications(role: str = Header(None)):
    verify_admin(role)
    notifs = list(notifications.find({"recipient_id": "ADMIN"}).sort("timestamp", -1))
    for n in notifs:
        n["_id"] = str(n["_id"])
    return notifs


# =========================================================
# CLAIM STATUS UPDATE
# =========================================================
class StatusUpdate(BaseModel):
    Policy_id: str
    status: str
    reason: Optional[str] = ""


@router.post("/admin/logs/update-status")
def update_log_status(data: StatusUpdate, role: str = Header(None)):
    verify_admin(role)

    log_entry = fraud_logs.find_one(
        {"$or": [{"policy_id": data.Policy_id}, {"Policy_id": data.Policy_id}]},
        sort=[("created_at", -1)]
    )

    if not log_entry:
        raise HTTPException(status_code=404, detail="Claim log not found")

    fraud_logs.update_one(
        {"_id": log_entry["_id"]},
        {"$set": {
            "status": data.status,
            "verified": True,
            "admin_reason": data.reason,
            "updated_at": now()
        }}
    )

    return {"message": f"Claim {data.status} successfully"}
