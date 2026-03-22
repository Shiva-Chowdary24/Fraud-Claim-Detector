from fastapi import APIRouter, HTTPException, Body, status, Header # ✅ Added Header
from fastapi.encoders import jsonable_encoder
from typing import List, Optional
from database import policies 

router = APIRouter()

# Helper to convert MongoDB ObjectId to string safely
def policy_helper(policy) -> dict:
    if not policy:
        return {}
    return {
        "id": str(policy["_id"]),
        "plan_name": policy.get("plan_name", "N/A"),
        "premium_amount": policy.get("premium_amount", 0),
        "tenure": policy.get("tenure", 0),
        "description": policy.get("description", ""),
        "benefits": policy.get("benefits", ""),
        "category": policy.get("category", "health") # ✅ Added for your Dynamic Form idea
    }

# --- ADMIN: Create a New Policy ---
@router.post("/admin/add-policy", status_code=status.HTTP_201_CREATED)
async def create_policy(policy_data: dict = Body(...), role: Optional[str] = Header(None)):
    # ✅ SECURITY CHECK: Ensure the request came from an Admin
    if role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized: Admin role required")

    try:
        new_policy = policies.insert_one(policy_data)
        created = policies.find_one({"_id": new_policy.inserted_id})
        return policy_helper(created)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create policy: {str(e)}")

# --- CUSTOMER: Get All Policies ---
@router.get("/customer/available-policies", response_model=List[dict])
async def get_all_policies():
    """
    Fetches the catalog for the CustApplyPolicy page. 
    Usually, customers don't need a role check to SEE available plans.
    """
    try:
        raw_policies = list(policies.find())
        return [policy_helper(p) for p in raw_policies]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not fetch policies")

# --- ADMIN: Get All Policies (for Management) ---
@router.get("/admin/available-policies", response_model=List[dict])
async def admin_get_policies(role: Optional[str] = Header(None)):
    # ✅ SECURITY CHECK
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access denied")

    try:
        raw_policies = list(policies.find())
        return [policy_helper(p) for p in raw_policies]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
