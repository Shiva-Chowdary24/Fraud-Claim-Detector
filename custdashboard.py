from fastapi import APIRouter, HTTPException, Query
from pymongo import MongoClient
from database import policies,issued_policies,claim_policies
router = APIRouter()

@router.get("/customer/dashboard-stats")
def get_customer_dashboard_stats(customer_id: str = Query(...)):
    try:
        customer_id = customer_id.strip()

        # 1️⃣ Get all issued policy IDs for the customer
        issued_policy_ids = issued_policies.distinct(
            "policy_id",
            {"customer_id": customer_id}
        )

        # Applied = number of issued policies
        applied_policies_count = len(issued_policy_ids)

        # 2️⃣ Count claimed policies where policy_id matches issued ones
        claimed_policies_count = 0
        if issued_policy_ids:
            claimed_policies_count = claim_policies.count_documents({
                "policy_id": {"$in": issued_policy_ids}
            })

        # 3️⃣ Available policies (global)
        available_policies_count = policies.count_documents({})

        return {
            "available_policies": available_policies_count,
            "applied_policies": applied_policies_count,
            "claimed_policies": claimed_policies_count
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dashboard stats fetch failed: {str(e)}"
        )
