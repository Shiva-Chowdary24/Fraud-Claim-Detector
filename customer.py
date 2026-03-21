from fastapi import APIRouter, HTTPException
from database import policy_requests, issued_policies, queries, notifications
from datetime import datetime
from bson import ObjectId
from uuid import uuid4
from typing import List

router = APIRouter()

def now():
    return datetime.utcnow().isoformat()

# --- CUSTOMER: Submit Policy Application ---
@router.post("/customer/submit-application")
def submit_application(data: dict):
    try:
        # 1. Validation
        if not data.get("full_name") or not data.get("policy_id"):
            raise HTTPException(status_code=400, detail="Required fields are missing.")

        # 2. Add Request Metadata
        data["request_id"] = f"REQ-{str(uuid4())[:6].upper()}"
        data["status"] = "Pending"
        data["submitted_at"] = now()
        
        # 3. Insert into policy_requests collection (Waiting for Admin)
        policy_requests.insert_one(data) 
        
        return {"message": "Application submitted for Admin approval", "request_id": data["request_id"]}
    except Exception as e:
        print(f"Submission Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
@router.get("/customer/full-history")
def get_full_history(customer_id: str = Query(...)):
    try:
        # 1. Fetch data from the 'Requests' folder (Pending/Declined)
        # We filter by the 6-digit customer_id
        pending_data = list(policy_requests.find({"customer_id": customer_id}))
        
        # 2. Fetch data from the 'Issued' folder (Approved/Active)
        active_data = list(issued_policies.find({"customer_id": customer_id}))
        
        # 3. Combine both lists into one big "History"
        full_history = []

        # Process Pending/Declined items
        for item in pending_data:
            item["_id"] = str(item["_id"]) # Convert MongoDB ID to string
            full_history.append(item)

        # Process Active items
        for item in active_data:
            item["_id"] = str(item["_id"])
            # Ensure status is 'Active' for display logic
            item["status"] = "Active" 
            full_history.append(item)

        # 4. Sort by date so the newest application is at the top
        # It checks for 'submitted_at' first, then 'issued_date'
        full_history.sort(
            key=lambda x: x.get("submitted_at") or x.get("issued_date") or "", 
            reverse=True
        )

        return full_history

    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
