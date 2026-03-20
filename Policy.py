from fastapi import APIRouter, HTTPException, Body, status
from database import policies  # Ensure this points to db["Policies"]
from typing import List

router = APIRouter()

# Helper to format the MongoDB response for React
def policy_helper(policy) -> dict:
    return {
        "id": str(policy["_id"]),
        "plan_name": policy["plan_name"],
        "premium_amount": policy["premium_amount"],
        "tenure": policy["tenure"],
        "description": policy["description"],
        "benefits": policy["benefits"]
    }

@router.post("/admin/add-policy", status_code=status.HTTP_201_CREATED)
async def add_policy(data: dict = Body(...)):
    try:
        res = policies.insert_one(data)
        return {"message": "Policy added", "id": str(res.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer/available-policies", response_model=List[dict])
async def get_policies():
    return [policy_helper(p) for p in policies.find()]
