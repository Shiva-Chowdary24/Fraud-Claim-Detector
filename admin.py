from fastapi import APIRouter, HTTPException, Header
from database import policy_requests, issued_policies, notifications, audit_logs, queries, fraud_logs,policies
from datetime import datetime
from bson import ObjectId
import random
from pydantic import BaseModel

router = APIRouter()

# ✅ HELPER: Using utcnow() is good, but ensure datetime is imported
def now():
    return datetime.utcnow().isoformat()

# ✅ HELPER: Security Gatekeeper
def verify_admin(role: str):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required.")

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

        # ✅ FETCH FROM MASTER COLLECTION
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

            # from request
            "plan_name": req.get("plan_name"),
            "email": req.get("email"),

            # 🔥 from policies collection (FIX)
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

        return {
            "message": "Approved",
            "policy_id": generated_id
        }

    except Exception as e:
        print("ERROR:",str(e))
        raise HTTPException(500, f"Error: {str(e)}")

# -------- QUERIES, AUDIT & NOTIFICATIONS --------

# @router.get("/admin/queries")
# def get_queries(role: str = Header(None)):
#    if role != "admin":
#        raise HTTPException(status_code=403, detail="Admin access required")
#    # Filter for Pending only so the list clears as you reply
#    results = list(queries.find({"status": "Pending"}))
#    for r in results:
#        r["_id"] = str(r["_id"])
#    return results
# @router.post("/admin/reply/{query_id}")
# def reply_query(query_id: str, data: dict):
#    reply_text = data.get("reply")
#    # 1. Update query status
#    query_obj = queries.find_one({"_id": ObjectId(query_id)})
#    if not query_obj:
#        raise HTTPException(status_code=404, detail="Query not found")
#    queries.update_one(
#        {"_id": ObjectId(query_id)},
#        {"$set": {"status": "Resolved", "reply": reply_text, "resolved_at": now()}}
#    )
#    # 2. Notify the customer
#    notifications.insert_one({
#        "recipient_id": str(query_obj.get("customer_id") or query_obj.get("email")),
#        "message": f"New reply to your query: '{query_obj.get('subject')}'",
#        "type": "support_reply",
#        "timestamp": now(),
#        "read": False
#    })
#    return {"message": "Reply sent successfully"}

# ✅ FIXED: Renamed this function to 'get_audit_logs' to avoid duplicate name 'audit'
@router.get("/admin/audit-logs")
def get_audit_logs(role: str = Header(None)):
    verify_admin(role)
    return list(audit_logs.find({}, {"_id": 0}).sort("timestamp", -1))

# ✅ FIXED: Renamed this function to 'get_fraud_logs' to avoid duplicate name 'audit'
@router.get("/admin/logs")
def get_fraud_logs(role: str = Header(None)):
    verify_admin(role)
    # CRITICAL: If you want notifications to work, the logs in fraud_logs 
    # MUST contain the 'customer_id' field.
    return list(fraud_logs.find({}, {"_id": 0}).sort("timestamp", -1))

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
    reason: Optional[str]=""

@router.post("/admin/logs/update-status")
def update_log_status(data: StatusUpdate, role: str = Header(None)): # ✅ Removed 'async' for PyMongo
    verify_admin(role) # Added security check
    try:
        # ✅ REAL LOGIC: Update the actual claim/fraud log in DB
        result = fraud_logs.update_one(
            {"Policy_id": data.Policy_id},
            {"$set": {"status": data.status,"admin_reason":data.reason,"updated_at": now()}}
        )
        
        print(f"Updating {data.Policy_id} to {data.status}")
        return {"message": "Success", "modified_count": result.modified_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
