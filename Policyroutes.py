from fastapi import APIRouter, HTTPException, Body, status
from fastapi.encoders import jsonable_encoder
from typing import List
from database import policies # This refers to db["Policies"] from your database file

router = APIRouter()

# Helper to convert MongoDB ObjectId to string
def policy_helper(policy) -> dict:
    return {
        "id": str(policy["_id"]),
        "plan_name": policy["plan_name"],
        "premium_amount": policy["premium_amount"],
        "tenure": policy["tenure"],
        "description": policy["description"],
        "benefits": policy["benefits"],
        "payout_estimate": policy["premium_amount"] * policy["tenure"] * 1.2 # Calculated for "Read More"
    }

# --- ADMIN: Create a New Policy ---
@router.post("/admin/add-policy", status_code=status.HTTP_201_CREATED)
async def create_policy(policy_data: dict = Body(...)):
    """
    Expects: {plan_name, premium_amount, tenure, description, benefits}
    """
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
    Fetches the catalog for the CustApplyPolicy page
    """
    try:
        policy_list = []
        for policy in policies.find():
            policy_list.append(policy_helper(policy))
        return policy_list
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching policy catalog")

# --- ADMIN: Get All Policies (for Management) ---
@router.get("/admin/available-policies", response_model=List[dict])
async def admin_get_policies():
    policy_list = []
    for policy in policies.find():
        policy_list.append(policy_helper(policy))
    return policy_list
