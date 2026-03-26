from fastapi import APIRouter, HTTPException
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Dict, Any

# ✅ Mongo collections
from database import claim_payouts, issued_policies, fraud_logs

router = APIRouter(tags=["Claim Payouts"])

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def now():
    return datetime.utcnow().isoformat()

# -------------------------------------------------
# Models
# -------------------------------------------------
class SavePayoutRequest(BaseModel):
    """
    ✅ Sent ONLY from party blast
    customer_id is NOT accepted from frontend anymore
    """
    policy_id: str = Field(..., min_length=1)
    predicted_payable_amount: float = Field(..., ge=0)

class SavePayoutResponse(BaseModel):
    message: str
    id: str

# -------------------------------------------------
# 1️⃣ SAVE PAYOUT (DERIVE CUSTOMER FROM POLICY)
# -------------------------------------------------
@router.post("/customer/payouts", response_model=SavePayoutResponse)
def save_claim_payout(data: SavePayoutRequest):
    try:
        policy_id = data.policy_id.strip()
        if not policy_id:
            raise HTTPException(status_code=400, detail="policy_id is required")

        # ✅ SOURCE OF TRUTH: issued_policies
        policy = issued_policies.find_one({"policy_id": policy_id})
        if not policy:
            raise HTTPException(status_code=404, detail="Issued policy not found")

        customer_id = policy.get("customer_id")
        if not customer_id:
            raise HTTPException(status_code=500, detail="customer_id missing in issued_policies")

        policy_name = policy.get("policy_name", "Unknown Policy")

        # Normalize policy status
        status_raw = policy.get("status")
        if isinstance(status_raw, bool):
            policy_status = "Active" if status_raw else "Inactive"
        elif isinstance(status_raw, str):
            policy_status = status_raw
        else:
            policy_status = "Unknown"

        payout_doc = {
            "customer_id": customer_id,
            "policy_id": policy_id,
            "policy_name": policy_name,
            "predicted_payable_amount": float(data.predicted_payable_amount),
            "policy_status": policy_status,
            "status": "Approved",
            "created_at": now(),
            "updated_at": now()
        }

        # ✅ UPSERT (1 payout per policy)
        existing = claim_payouts.find_one({"policy_id": policy_id})

        if existing:
            claim_payouts.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "predicted_payable_amount": payout_doc["predicted_payable_amount"],
                    "policy_status": payout_doc["policy_status"],
                    "policy_name": payout_doc["policy_name"],
                    "status": "Approved",
                    "updated_at": now()
                }}
            )
            return {"message": "Payout updated", "id": str(existing["_id"])}

        result = claim_payouts.insert_one(payout_doc)
        return {"message": "Payout saved", "id": str(result.inserted_id)}

    except HTTPException:
        raise
    except Exception as e:
        print("ERROR in save_claim_payout:", str(e))
        raise HTTPException(status_code=500, detail="Failed to save payout")

# -------------------------------------------------
# 2️⃣ FETCH CLAIM HISTORY (Customer View)
# -------------------------------------------------
@router.get("/customer/claim-history/{customer_id}")
def get_claim_history(customer_id: str):
    try:
        cid = (customer_id or "").strip()
        if not cid:
            raise HTTPException(status_code=400, detail="customer_id is required")

        approved_docs = list(
            claim_payouts.find({"customer_id": cid}).sort("updated_at", -1)
        )

        declined_docs = list(
            fraud_logs.find({"customer_id": cid, "status": "Declined"}).sort("created_at", -1)
        )

        out: List[Dict[str, Any]] = []

        # ✅ Approved payouts
        for d in approved_docs:
            out.append({
                "Policy_id": d.get("policy_id"),
                "policy_name": d.get("policy_name"),
                "predicted_payable_amount": d.get("predicted_payable_amount"),
                "policy_status": d.get("policy_status"),
                "status": "Approved",
                "reason": None
            })

        # ✅ Declined claims
        for d in declined_docs:
            pid = d.get("Policy_id") or d.get("policy_id")
            policy = issued_policies.find_one({"policy_id": pid}) or {}

            status_raw = policy.get("status")
            if isinstance(status_raw, bool):
                policy_status = "Active" if status_raw else "Inactive"
            elif isinstance(status_raw, str):
                policy_status = status_raw
            else:
                policy_status = "Unknown"

            out.append({
                "Policy_id": pid,
                "policy_name": d.get("policy_name") or policy.get("policy_name") or "Unknown Policy",
                "predicted_payable_amount": None,
                "policy_status": policy_status,
                "status": "Declined",
                "reason": d.get("reason") or d.get("rejection_reason") or "Declined by screening"
            })

        return out

    except HTTPException:
        raise
    except Exception as e:
        print("ERROR in /customer/claim-history:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch claim history")
