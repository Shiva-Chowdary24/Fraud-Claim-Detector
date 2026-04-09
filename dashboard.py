from fastapi import APIRouter, HTTPException, Header

from database import issued_policies, fraud_logs, users, policies

from typing import Optional

router = APIRouter(tags=["Admin Dashboard"])

def verify_admin(role: Optional[str]):

    if role != "admin":

        raise HTTPException(status_code=403, detail="Admin access required")

@router.get("/admin/dashboard")

def get_dashboard_stats(role: Optional[str] = Header(None)):

    verify_admin(role)

    try:

        # Fetch real-time counts from MongoDB collections

        total_claims = issued_policies.count_documents({})

        frauds_detected = fraud_logs.count_documents({})

        total_customers = users.count_documents({"role": "customer"}) # Assuming you have roles

        available_policies = policies.count_documents({})

        return {

            "totalClaims": total_claims,

            "fraudsDetected": frauds_detected,

            "totalCustomers": total_customers,

            "availablePolicies": available_policies

        }

    except Exception as e:

        print(f"Dashboard Error: {e}")

        raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")
