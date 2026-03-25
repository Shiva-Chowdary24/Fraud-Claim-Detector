from fastapi import APIRouter, HTTPException, Query,Header,Body
from database import policy_requests, issued_policies, queries, notifications,policies,claim_policies,fraud_logs
from datetime import datetime
from bson import ObjectId
from uuid import uuid4
from pydantic import BaseModel

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
# @router.post("/query")
# def ask_query(data: dict):
#    data["status"] = "Pending"
#    data["timestamp"] = now()
#    queries.insert_one(data)
#    return {"message": "Query sent"}

# --- 5. LEGACY ROUTES (Optional - for backward compatibility) ---
@router.get("/customer/issued-policies")
def get_issued(customer_id: str, role: str = Header(None)):
    # 1. Security Check
    if role != "customer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        # 2. Search by customer_id (ensure this matches your DB field name)
        query={
            "$or":[
                {"customer_id":customer_id},
                {"customer_id":int(customer_id) if customer_id.isdigit() else customer_id}
            ]
        }
        results = list(issued_policies.find(query))
        
        for r in results:
            r["_id"] = str(r["_id"])
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database fetch failed")
@router.get("/customer/claim-history/{customer_id}")
def get_claim_history(customer_id: str):
    try:
        # We fetch only processed claims (Approved/Declined) 
        # for the specific logged-in customer
        query = {
            "customer_id": str(customer_id),
            "status": {"$in": ["Approved", "Declined"]}
        }
        
        # .sort("updated_at", -1) ensures the newest decisions are at the top
        results = list(fraud_logs.find(query).sort("updated_at", -1))
        
        for r in results:
            r["_id"] = str(r["_id"]) # Convert MongoDB ID to string for React
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer/policy-details/{policy_id}")
def get_policy(policy_id: str):
    try:
        print("Incoming policy_id:", policy_id)

        policy = issued_policies.find_one({"policy_id": policy_id})
        

        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")


        return {
        "policy_id":policy["policy_id"],
        "plan_name": policy["plan_name"],
        "premium": policy["premium_amount"],          # ✅ FIX
        "sum_assured": policy["total_claim_amount"],  # ✅ FIX
        "tenure": policy["tenure"],
        "plan_type": policy["plan_type"],
        "description": policy["description"],
        "benefits": policy["benefits"]
    }

    except Exception as e:
        print("ERROR:", str(e))  # 👈 THIS WILL SHOW REAL ISSUE
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/policy/{policy_id}")
def get_policy(policy_id: str):
    policy = find_one({"policy_id": policy_id}, {"_id": 0})

    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    return policy

from pydantic import BaseModel

class ClaimPrediction(BaseModel):
    policy_id: str
    claimable_amount: float


@router.post("/customer/amount-predict/store")
def store_claim_prediction(data: ClaimPrediction):
    try:
        claim_policies.insert_one({
            "policy_id": data.policy_id,
            "claimable_amount": data.claimable_amount,
            "status": "Active",
            "predicted_at": datetime.utcnow().isoformat()
        })

        return {"message": "Claim prediction stored successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customer/claim-policies/{customer_id}")
def get_claim_policies(customer_id: str):
    try:
        results = list(
            claim_policies.find(
                {},
                {"_id": 0}
            ).sort("predicted_at", -1)
        )
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class FalseClaimRequest(BaseModel):
    customer_id:str
    policy_id:str
    reason:str
FalseClaimRequest.model_rebuild()
@router.post("/customer/false-claim")
def submit_false_claim(data: FalseClaimRequest=Body(...)):
    try:
        # ✅ 1. SAVE THE FALSE CLAIM (THIS WAS MISSING)
        claim_data = {
            "customer_id": str(data.customer_id),
            "policy_id": data.policy_id,
            "reason": data.reason,
            "status": "Pending",
            "verified":False,
            "timestamp": datetime.utcnow()
        }

        fraud_logs.insert_one(claim_data)

        # ✅ 2. NOTIFY ADMIN (CORRECT PLACE)
        try:
            notif=notifications.insert_one({
                "recipient_id": "ADMIN",
                "message": f" Review the Claim submitted by customer Id: {data.customer_id} of Policy Id: {data.policy_id}",
                "link": "/admin/logs",
                "type": "false_claim_request",
                "timestamp": datetime.utcnow(),
                "read": False
            })
        except Exception as e:
                print("Notification failed:,str(e)")
        return {"message": "False claim submitted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
