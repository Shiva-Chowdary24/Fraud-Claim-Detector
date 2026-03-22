import joblib
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["Payout Estimation"])

# --- LOAD PAYOUT MODEL ---
PAYOUT_MODEL_PATH = os.path.join("artifacts", "payout_model.joblib")
try:
    # Load the specific model for calculating the dollar amount
    payout_model = joblib.load(PAYOUT_MODEL_PATH)
    print("✅ Payout Estimation Model Loaded")
except Exception as e:
    print(f"⚠️ Payout Model not found: {e}")
    payout_model = None

class PayoutRequest(BaseModel):
    policy_id: str
    customer_id: str
    claim_amount: float
    vehicle_age: Optional[int] = 0
    vehicle_tier: Optional[str] = "Economy"
    # Add other health/auto fields your model needs

@router.post("/calculate-payout")
def calculate_payout(data: PayoutRequest):
    if not payout_model:
        # Fallback logic if the model isn't ready
        # Calculate 90% of claim_amount as a safe estimate
        estimated_amount = round(data.claim_amount * 0.9, 2)
        return {"amount": estimated_amount, "status": "Estimated (Fallback)"}

    try:
        # 1. Convert PayoutRequest to the format your model expects (DataFrame/List)
        features = [[data.claim_amount, data.vehicle_age]] # Example features
        
        # 2. Predict the numerical amount
        prediction = payout_model.predict(features)
        final_amount = round(float(prediction[0]), 2)

        return {
            "amount": final_amount,
            "policy_id": data.policy_id,
            "status": "AI_Calculated"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Calculation error: {str(e)}")
