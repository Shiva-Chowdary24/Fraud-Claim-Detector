from fastapi import APIRouter, HTTPException, Header
from database import policy_requests, issued_policies, notifications, audit_logs, queries, fraud_logs,policies
from datetime import datetime,timezone
from bson import ObjectId
import random
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# ✅ HELPER: Using utcnow() is good, but ensure datetime is imported
def now():
    return datetime.utcnow()

# ✅ HELPER: Security Gatekeeper
def verify_admin(role: str):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required.")

def log_admin_action(admin_email: str, action: str, details: str):
    audit_logs.insert_one({
        "admin":admin_email,
        "action":action,
        "details":details,
        "timestamp":datetime.utcnow(),
    })
# -------- POLICY APPROVALS --------

@router.get("/admin/policy-requests")
def get_requests(role: str = Header(None)):
    verify_admin(role)
    try:
        results = list(policy_requests.find({"status": "Pending"}))
        for r in results:
            r["_id"] = str(r["_id"]) 
        return results
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")


@router.post("/admin/policy-approve/{request_id}")
def approve(request_id: str, role: str = Header(None)):
    verify_admin(role)

    try:
        req = policy_requests.find_one({"_id": ObjectId(request_id)})
        if not req:
            raise HTTPException(404, "Application not found")

        policy_master = policies.find_one({
            "plan_name": req.get("plan_name")
        })

        if not policy_master:
            raise HTTPException(404, "Policy not found in master collection")

        plan_name = req.get("plan_name", "POL")
        prefix = plan_name[:3].upper()
        generated_id = f"PL-{prefix}-{random.randint(1000, 9999)}"

        issued_data = {
            "policy_id": generated_id,
            "customer_id": req.get("customer_id"),
            "plan_name": plan_name,
            "email": req.get("email"),
            "plan_type": policy_master.get("plan_type"),
            "premium_amount": policy_master.get("premium_amount"),
            "total_claim_amount": policy_master.get("total_claim_amount"),
            "tenure": policy_master.get("tenure"),
            "description": policy_master.get("description"),
            "benefits": policy_master.get("benefits"),
            "status": "Active",
            "approved_at": now()
        }

        issued_policies.insert_one(issued_data)
        policy_requests.delete_one({"_id": ObjectId(request_id)})
        
        notifications.insert_one({
            "recipient_id": str(req.get("customer_id")),
            "message": f" Policy '{plan_name}' has been Issued Successfully.",
            "link": "/customer/issued-policies",
            "type": "policy_approved",
            "timestamp": now(),
            "read": False
        })

        # ✅ AUDIT LOG (FIXED)
        log_admin_action(
            "admin1@gmail.com",
            "POLICY_ISSUED",
            f"Issued policy {plan_name} to customer {req.get('customer_id')}",
            
        )

        return {
            "message": "Approved",
            "policy_id": generated_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/policy-decline/{request_id}")
def decline_policy(request_id: str, role: str = Header(None)):
    verify_admin(role)

    try:
        # ✅ Fetch request
        req = policy_requests.find_one({"_id": ObjectId(request_id)})
        if not req:
            raise HTTPException(status_code=404, detail="Application not found")

        customer_id = req.get("customer_id")

        # ✅ Send notification to customer
        notifications.insert_one({
            "recipient_id": str(customer_id),
            "message": (
                "Your policy request was declined. "
                "The policy was not issued. "
                "Please contact the administrator through support."
            ),
            "link": "/customer/ask-question",
            "type": "policy_declined",
            "timestamp": now(),
            "read": False
        })

        # ✅ Audit log
        log_admin_action(
            "admin1@gmail.com",
            "POLICY_ISSUED",
            f"Issued policy {plan_name} to customer {req.get('customer_id')}",
            
        )

        # ✅ Delete the request record
        policy_requests.delete_one({"_id": ObjectId(request_id)})

        return {
            "message": "Policy request declined and customer notified"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/audit-logs")
def get_audit_logs(role: str = Header(None)):
    verify_admin(role)
    return list(audit_logs.find({}, {"_id": 0}).sort("timestamp", -1))

# ✅ FIXED: Renamed this function to 'get_fraud_logs' to avoid duplicate name 'audit'
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

        dt = None

        if isinstance(ts, datetime):

            dt = ts

        elif isinstance(ts, str):

            try:

                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))

            except:

                dt = datetime.min

        else:

            dt = datetime.min

        # 🔥 THE FIX: If dt has a timezone (aware), convert to UTC and remove it (naive)

        if dt.tzinfo is not None:

            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)

        return (verified, dt)

    return sorted(logs, key=sort_key, reverse=True)
 

@router.get("/admin/notifications")
def get_admin_notifications(role: str = Header(None)):
    verify_admin(role)
    notifs = list(notifications.find({"recipient_id": "ADMIN"}).sort("timestamp", -1))
    for n in notifs:
        n["_id"] = str(n["_id"])
    return notifs

# -------- LOG STATUS UPDATES --------
class StatusUpdate(BaseModel):
    Policy_id: str
    status: str
    reason: Optional[str] = ""


@router.post("/admin/logs/update-status")

def update_log_status(data: StatusUpdate, role: str = Header(None)):

    verify_admin(role)

    try:

        # 1. Get the log first to find the customer_id

        log_entry = fraud_logs.find_one({"Policy_id": data.Policy_id})

        if not log_entry:

             log_entry = fraud_logs.find_one({"policy_id": data.Policy_id})

        if not log_entry:

            raise HTTPException(status_code=404, detail="Claim log not found")

        cust_id = log_entry.get("customer_id")

        # 2. Update the status

        fraud_logs.update_one(

            {"_id": log_entry["_id"]},

            {

                "$set": {

                    "status": data.status,

                    "verified": True,

                    "admin_reason": data.reason,

                    "updated_at": datetime.utcnow()

                }

            }

        )

        # ✅ 3. DYNAMIC REDIRECTION LOGIC

        # Determine link based on status (case-insensitive check)

        target_link = "/customer/amount-predict" if data.status.lower() == "approved" else "/customer/ask-question"
        msg=f"Your claim for Policy {data.Policy_id} has been {data.status}, Click here to get an Estimation of Claimable amount." if data.status.lower()=="approved" else f"Your claim for Policy {data.Policy_id} has been {data.status}, Contact Administrator."
        # 4. NOTIFY CUSTOMER

        notifications.insert_one({

            "recipient_id": str(cust_id),

            "message": msg,

            "link": target_link, 

            "type": "claim_update",

            "timestamp": datetime.utcnow(),

            "read": False

        })
        log_admin_action(
            "admin@system.com", # The 'admin_email' argument
            "Claim Status Updated", # The 'action' argument
            f"Claim of Policy: {data.Policy_id} is {data.status}" # The 'details' argument
            )

        return {"message": f"Claim {data.status} successfully"}

    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))
 
