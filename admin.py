from fastapi import APIRouter, HTTPException
from database import policy_requests, customers, notifications, audit_logs, queries, dealers, fraud_logs
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Response, status
router = APIRouter()

def now():
    return datetime.utcnow().isoformat()

# -------- POLICY --------

@router.get("/policy-requests")
def get_requests():
    return list(policy_requests.find({}, {"_id": 0}))

@router.post("/admin/policy-approve/{request_id}")
def approve_policy(request_id: str):
    # 1. Find the application request
    req = policy_requests.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(404, "Request not found")

    # 2. Generate the Policy ID (e.g., PL-HEA-1234)
    plan_prefix = req.get("plan_name", "POL")[:3].upper()
    policy_serial = f"PL-{plan_prefix}-{random.randint(1000, 9999)}"

    # 3. Create the Issued Policy Record
    # This links the Policy to the Permanent 6-digit Customer ID
    issued_data = {
        "policy_id": policy_serial,       
        "customer_id": req.get("customer_id"), # The 6-digit ID from signup
        "email": req.get("email"),
        "full_name": req.get("full_name"),
        "plan_name": req.get("plan_name"),
        "premium_amount": req.get("premium_amount"),
        "tenure": req.get("tenure"),
        "status": "Active",
        "issued_date": datetime.utcnow().isoformat()
    }

    # 4. Move data between collections
    issued_policies.insert_one(issued_data)
    policy_requests.delete_one({"_id": ObjectId(request_id)})

    return {"message": "Policy Approved", "policy_id": policy_serial}

@router.post("/decline/{policy}")
def decline(policy: str):
    policy_requests.update_one(
        {"Policy": policy},
        {"$set": {"status": "Declined"}}
    )

    notifications.insert_one({
        "message": f"Policy {policy} declined",
        "read": False,
        "timestamp": now()
    })

    return {"message": "Declined"}

# -------- DEALERS --------

@router.post("/admin/dealer/add")
def add_dealer(data: dict):
    if not data.get("Policy"):
        raise HTTPException(400, "Policy required")

    dealers.insert_one(data)
    return {"message": "Added"}


@router.delete("/admin/dealer/delete/{policy}")
def delete_dealer(policy: str):
    res = dealers.delete_one({"Policy": policy})
    if res.deleted_count == 0:
        # Strict semantics: report not found
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


@router.get("/admin/dealer/logs")
def logs():
    return list(fraud_logs.find({}, {"_id": 0}))

# -------- QUERIES --------

@router.get("/queries")
def get_queries():
    return list(queries.find())

@router.post("/reply/{id}")
def reply(id: str, data: dict):
    queries.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"reply": data["reply"], "status": "Answered"}}
    )

    q = queries.find_one({"_id": ObjectId(id)})

    notifications.insert_one({
        "user": q.get("email"),
        "message": "Query answered",
        "read": False,
        "timestamp": now()
    })

    audit_logs.insert_one({
        "action": "Reply",
        "details": q.get("email"),
        "timestamp": now()
    })

    return {"message": "Replied"}

# -------- AUDIT --------

@router.get("/audit-logs")
def audit():
    return list(audit_logs.find({}, {"_id": 0}).sort("timestamp", -1))
