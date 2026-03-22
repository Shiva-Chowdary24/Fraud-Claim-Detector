from fastapi import APIRouter, HTTPException, Header
from database import policy_requests, issued_policies, notifications, audit_logs, queries,fraud_logs
from datetime import datetime
from bson import ObjectId
import random
from pydantic import BaseModel

router = APIRouter()

def now():
    return datetime.utcnow().isoformat()

# ✅ HELPER: Security Gatekeeper
def verify_admin(role: str):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required.")

# -------- POLICY APPROVALS --------

@router.get("/admin/policy-requests")
def get_requests(role: str = Header(None)): # 👈 Role checked here
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

        plan_name = req.get("plan_name", "POL")
        prefix = plan_name[:3].upper()
        generated_id = f"PL-{prefix}-{random.randint(1000, 9999)}"
        customer_id = req.get("customer_id")

        issued_data = {**req, "policy_id": generated_id, "status": "Active", "approved_at": now()}
        issued_data.pop("_id", None) 

        issued_policies.insert_one(issued_data)
        policy_requests.delete_one({"_id": ObjectId(request_id)})

        # Notify Customer
        notifications.insert_one({
            "recipient_id": customer_id,
            "message": f"Your {plan_name} policy was APPROVED! ID: {generated_id}",
            "type": "policy_update",
            "link": "/customer/policy-history",
            "read": False,
            "timestamp": now()
        })

        # Log Action
        audit_logs.insert_one({
            "action": "Approved",
            "details": f"Policy {generated_id} issued to {req.get('email')}",
            "timestamp": now()
        })

        return {"message": "Approved", "policy_id": generated_id}
    except Exception as e:
        raise HTTPException(500, "Internal Error")

@router.post("/admin/policy-decline/{request_id}")
def decline(request_id: str, role: str = Header(None)):
    verify_admin(role)
    try:
        policy_requests.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": "Declined", "declined_at": now()}}
        )
        return {"message": "Declined"}
    except Exception as e:
        raise HTTPException(500, str(e))

# -------- QUERIES, AUDIT & NOTIFICATIONS --------

@router.get("/admin/queries")
def get_queries(role: str = Header(None)):
    verify_admin(role)
    results = list(queries.find())
    for r in results:
        r["_id"] = str(r["_id"])
    return results

@router.get("/admin/audit-logs")
def audit(role: str = Header(None)):
    verify_admin(role)
    return list(audit_logs.find({}, {"_id": 0}).sort("timestamp", -1))

@router.get("/admin/logs")
def audit(role: str = Header(None)):
    verify_admin(role)
    return list(fraud_logs.find({}, {"_id": 0}).sort("timestamp", -1))

@router.get("/admin/notifications")
def get_admin_notifications(role: str = Header(None)):
    verify_admin(role)
    notifs = list(notifications.find({"recipient_id": "ADMIN"}).sort("timestamp", -1))
    for n in notifs:
        n["_id"] = str(n["_id"])
    return notifs
# 1. Define the model
class StatusUpdate(BaseModel):
    Policy_id: str
    status: str

# 2. Update the function signature 
# Change 'data' to use the 'StatusUpdate' type
@router.post("/admin/logs/update-status")
async def update_log_status(data: StatusUpdate):  # <--- MUST use the Class name here
    try:
        # Now 'data' is an object. Access fields like data.Policy_id
        print(f"Updating {data.Policy_id} to {data.status}")
        return {"message": "Success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

