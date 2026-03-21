from fastapi import APIRouter, HTTPException,Query
from database import policy_requests, issued_policies, queries, notifications
from datetime import datetime
from bson import ObjectId
from uuid import uuid4
from typing import List

router = APIRouter()

def now():
    return datetime.utcnow().isoformat()



# --- CUSTOMER: View My Applications Status ---
@router.get("/my-requests")
def my_requests(email: str):
    # Fetching pending/rejected requests
    results = list(policy_requests.find({"email": email}))
    for r in results:
        r["_id"] = str(r["_id"])
    return results

# --- CUSTOMER: View My Approved (Issued) Policies ---
@router.get("/issued-policies")
def get_issued_policies(email: str):
    # Fetching policies that were already approved by Admin
    results = list(issued_policies.find({"email": email}))
    for r in results:
        r["_id"] = str(r["_id"])
    return results

# --- HELP & NOTIFICATIONS ---
@router.post("/query")
def ask_query(data: dict):
    data["status"] = "Pending"
    data["timestamp"] = now()
    queries.insert_one(data)
    return {"message": "Query sent"}

@router.get("/notifications")
def get_notifications(email: str):
    result = list(notifications.find({"user": email}).sort("timestamp", -1))
    for r in result:
        r["_id"] = str(r["_id"])
    return result
@router.get("/issued-policies")
def get_issued_policies(email: str):
    try:
        # Fetch from the collection where Admin moved the data
        results = list(issued_policies.find({"email": email}))
        for r in results:
            r["_id"] = str(r["_id"])
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch issued policies")

@router.post("/customer/submit-application")
def submit_application(data: dict):
    try:
        # Check if IDs were sent automatically from Frontend
        if not data.get("customer_id") or not data.get("full_name"):
            raise HTTPException(status_code=400, detail="Session Error: Missing Customer Identity.")

        # Add Metadata
        data["request_id"] = f"REQ-{str(uuid4())[:6].upper()}"
        data["status"] = "Pending"
        data["submitted_at"] = datetime.utcnow().isoformat()
        
        # Ensure ID is stored as string for consistent searching
        data["customer_id"] = str(data["customer_id"])

        policy_requests.insert_one(data)
        return {"message": "Application submitted successfully", "request_id": data["request_id"]}
        notifications.insert_one({
        "recipient_id": "ADMIN", # Global tag for all admins
        "message": f"New Policy Request from {data.get('full_name')} (ID: {data.get('customer_id')})",
        "type": "new_request",
        "link": "/admin/policy-requests",
        "read": False,
        "timestamp": datetime.utcnow().isoformat()
    })
    return {"message": "Submitted and Admin Notified"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer/full-history")
def get_full_history(customer_id: str = Query(...)):
    try:
        # Search for String or Integer versions for safety
        query = {"customer_id": customer_id}
        
        pending = list(policy_requests.find(query))
        active = list(issued_policies.find(query))
        
        combined = []
        for item in pending:
            item["_id"] = str(item["_id"])
            combined.append(item)
            
        for item in active:
            item["_id"] = str(item["_id"])
            item["status"] = "Active"
            combined.append(item)

        # Sort by most recent
        combined.sort(key=lambda x: x.get("submitted_at") or x.get("issued_date") or "", reverse=True)
        return combined
    except Exception as e:
        raise HTTPException(status_code=500, detail="History fetch failed")
