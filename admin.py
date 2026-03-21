from fastapi import APIRouter, HTTPException
from database import policy_requests, issued_policies, notifications, audit_logs, queries
from datetime import datetime
from bson import ObjectId
import random

router = APIRouter()

def now():
    return datetime.utcnow().isoformat()

# -------- POLICY APPROVALS --------

# 1. Fetch Pending Requests
@router.get("/admin/policy-requests")
def get_requests():
    try:
        # Fetch only 'Pending' requests to keep the Admin list clean
        results = list(policy_requests.find({"status": "Pending"}))
        for r in results:
            r["_id"] = str(r["_id"]) 
        return results
    except Exception as e:
        raise HTTPException(500, f"Error fetching requests: {str(e)}")

# 2. Approve Policy (With Notifications & Redirect Links)
@router.post("/admin/policy-approve/{request_id}")
def approve(request_id: str):
    try:
        # Find the specific request
        req = policy_requests.find_one({"_id": ObjectId(request_id)})
        if not req:
            raise HTTPException(404, "Application not found")

        # Generate Unique Policy ID
        plan_name = req.get("plan_name", "POL")
        prefix = plan_name[:3].upper()
        random_num = random.randint(1000, 9999)
        generated_id = f"PL-{prefix}-{random_num}"
        customer_id = req.get("customer_id")

        # Prepare issued data
        issued_data = {
            **req,
            "policy_id": generated_id,
            "status": "Active",
            "approved_at": now()
        }
        issued_data.pop("_id", None) 

        # Database Operations
        issued_policies.insert_one(issued_data)
        policy_requests.delete_one({"_id": ObjectId(request_id)})

        # ✅ NOTIFY CUSTOMER (With Action Link)
        notifications.insert_one({
            "recipient_id": customer_id,
            "message": f"Your {plan_name} policy was APPROVED! Policy ID: {generated_id}",
            "type": "policy_update",
            "link": "/customer/policy-history", # Redirects customer to history
            "read": False,
            "timestamp": now()
        })

        # Log the action
        audit_logs.insert_one({
            "action": "Approved",
            "details": f"Policy {generated_id} issued to {req.get('email')}",
            "timestamp": now()
        })

        return {"message": "Approved", "policy_id": generated_id}

    except Exception as e:
        print(f"Approval Error: {e}")
        raise HTTPException(500, "Internal Server Error during approval")

# 3. Decline Policy
@router.post("/admin/policy-decline/{request_id}")
def decline(request_id: str):
    try:
        req = policy_requests.find_one({"_id": ObjectId(request_id)})
        if not req:
            raise HTTPException(404, "Application not found")

        # Update status
        policy_requests.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": "Declined", "declined_at": now()}}
        )

        # ✅ NOTIFY CUSTOMER of Decline
        notifications.insert_one({
            "recipient_id": req.get("customer_id"),
            "message": f"Unfortunately, your application for {req.get('plan_name')} was declined.",
            "type": "policy_update",
            "link": "/customer/policy-history",
            "read": False,
            "timestamp": now()
        })

        return {"message": "Declined"}
    except Exception as e:
        raise HTTPException(500, str(e))

# -------- QUERIES & AUDIT --------

@router.get("/admin/queries")
def get_queries():
    results = list(queries.find())
    for r in results:
        r["_id"] = str(r["_id"])
    return results

@router.get("/admin/audit-logs")
def audit():
    # Sort logs by most recent first
    return list(audit_logs.find({}, {"_id": 0}).sort("timestamp", -1))

# -------- GLOBAL NOTIFICATIONS FETCH --------

@router.get("/admin/notifications")
def get_admin_notifications():
    # Fetch notifications meant for the Admin role
    notifs = list(notifications.find({"recipient_id": "ADMIN"}).sort("timestamp", -1))
    for n in notifs:
        n["_id"] = str(n["_id"])
    return notifs
