from fastapi import APIRouter, HTTPException, Query
from database import policy_requests, issued_policies, queries, notifications
from datetime import datetime
from bson import ObjectId
from uuid import uuid4

router = APIRouter()

def now():
    return datetime.utcnow().isoformat()

# --- 1. SUBMIT APPLICATION (Triggers Admin Notification) ---
@router.post("/customer/submit-application")
def submit_application(data: dict):
    try:
        # Check if IDs were sent automatically from Frontend
        if not data.get("customer_id") or not data.get("full_name"):
            raise HTTPException(status_code=400, detail="Session Error: Missing Customer Identity.")

        # Add Metadata
        data["request_id"] = f"REQ-{str(uuid4())[:6].upper()}"
        data["status"] = "Pending"
        data["submitted_at"] = now()
        
        # Ensure ID is stored as string for consistent searching
        data["customer_id"] = str(data["customer_id"])

        # Insert the application
        policy_requests.insert_one(data)

        # ✅ NOTIFY ADMIN (For the Bell Icon Action)
        notifications.insert_one({
            "recipient_id": "ADMIN", 
            "message": f"New Policy Request from {data.get('full_name')} (ID: {data.get('customer_id')})",
            "type": "new_request",
            "link": "/admin/policy-requests", # Redirects admin to approval page
            "read": False,
            "timestamp": now()
        })
        
        return {
            "message": "Application submitted successfully", 
            "request_id": data["request_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. FULL HISTORY (Merged View for Customer History Page) ---
@router.get("/customer/full-history")
def get_full_history(customer_id: str = Query(...)):
    try:
        query = {"customer_id": str(customer_id)}
        
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

        # Sort by most recent date
        combined.sort(key=lambda x: x.get("submitted_at") or x.get("issued_date") or "", reverse=True)
        return combined
    except Exception as e:
        raise HTTPException(status_code=500, detail="History fetch failed")

# --- 3. NOTIFICATIONS (For Customer Bell Icon) ---
@router.get("/customer/notifications")
def get_notifications(recipient_id: str = Query(...)):
    try:
        # Search by recipient_id to match the 6-digit Customer ID
        result = list(notifications.find({"recipient_id": str(recipient_id)}).sort("timestamp", -1))
        for r in result:
            r["_id"] = str(r["_id"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching notifications")

# --- 4. HELP & QUERIES ---
@router.post("/query")
def ask_query(data: dict):
    data["status"] = "Pending"
    data["timestamp"] = now()
    queries.insert_one(data)
    return {"message": "Query sent"}

# --- 5. LEGACY ROUTES (Optional - for backward compatibility) ---
@router.get("/issued-policies")
def get_issued_policies(email: str):
    results = list(issued_policies.find({"email": email}))
    for r in results:
        r["_id"] = str(r["_id"])
    return results
