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
