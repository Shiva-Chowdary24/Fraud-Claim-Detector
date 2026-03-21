from fastapi import APIRouter, HTTPException
from database import policy_requests, customers, queries, notifications
from datetime import datetime
from bson import ObjectId
from uuid import uuid4

router = APIRouter()

def now():
    return datetime.utcnow().isoformat()

@router.post("/apply-policy")
def apply_policy(data: dict):
    if not data.get("Policy") or not data.get("email"):
        raise HTTPException(400, "Missing fields")

    data["status"] = "Pending"
    data["timestamp"] = now()

    policy_requests.insert_one(data)

    return {"message": "Request sent"}

# --- CUSTOMER: Submit Policy Application ---
@router.post("/customer/submit-application")
async def submit_application(data: dict):
    try:
        # 1. Add a unique Request ID (for tracking before approval)
        data["request_id"] = str(uuid4())[:8].upper()
        data["status"] = "Pending"
        data["submitted_at"] = datetime.utcnow().isoformat()

        # 2. Insert into a NEW collection called 'policy_requests'
        # Ensure 'policy_requests' is defined in your database.py
        result = await db.policy_requests.insert_one(data) 
        
        return {"message": "Application submitted", "request_id": data["request_id"]}
    except Exception as e:
        print(f"Submission Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save application")

@router.get("/my-requests")
def my_requests(email: str):
    return list(policy_requests.find({"email": email}, {"_id": 0}))

@router.get("/issued-policies")
def issued(email: str):
    return list(customers.find({"email": email}, {"_id": 0}))

@router.post("/query")
def ask_query(data: dict):
    if not data.get("email") or not data.get("query"):
        raise HTTPException(400, "Missing fields")

    data["status"] = "Pending"
    data["timestamp"] = now()

    queries.insert_one(data)

    return {"message": "Query sent"}

@router.get("/my-queries")
def my_queries(email: str):
    return list(queries.find({"email": email}, {"_id": 0}))

@router.get("/notifications")
def get_notifications(email: str):
    result = list(notifications.find({"user": email}).sort("timestamp", -1))

    for r in result:
        r["_id"] = str(r["_id"])

    return result

@router.post("/notification-read/{id}")
def mark_read(id: str):
    notifications.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"read": True}}
    )

    return {"message": "Read"}