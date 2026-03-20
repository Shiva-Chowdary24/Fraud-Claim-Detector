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

@router.post("/approve/{policy}")
def approve(policy: str):
    req = policy_requests.find_one({"Policy": policy})

    if not req:
        raise HTTPException(404, "Not found")

    req.pop("_id", None)

    customers.insert_one(req)

    policy_requests.update_one(
        {"Policy": policy},
        {"$set": {"status": "Approved"}}
    )

    notifications.insert_one({
        "user": req.get("email"),
        "message": f"Policy {policy} approved",
        "read": False,
        "timestamp": now()
    })

    audit_logs.insert_one({
        "action": "Approved",
        "details": policy,
        "timestamp": now()
    })

    return {"message": "Approved"}

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