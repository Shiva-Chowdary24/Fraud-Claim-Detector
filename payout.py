import joblib
import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Extra
from typing import Optional

router = APIRouter(tags=["Payout Estimation"])

# --- LOAD PAYOUT MODEL ---
PAYOUT_MODEL_PATH = os.path.join("artifacts", "amount_model.joblib")
try:
    payout_model = joblib.load(PAYOUT_MODEL_PATH)
    print("✅ Health Payout Model Loaded")
except Exception as e:
    print(f"⚠️ Payout Model not found: {e}")
    payout_model = None

# --- UPDATED SCHEMA (NO HARDCODED DEFAULTS) ---
class PayoutRequest(BaseModel):
    policy_id: str
    customer_id: str  # ✅ Now strictly required from user input
    claim_amount: float # ✅ Now strictly required from user input
    
    # Health Specific Fields
    age: int
    policy_tenure_years: float
    prior_claims_count: int
    incident_severity: str
    region_risk_level: str
    bmi: float
    bloodpressure: int
    diabetes: int
    hereditary_diseases: str
    smoker: int
    regular_ex: int
    weight: int
    health_risk_score: int
    policy_coverage_details: str
    sum_assured: float
    premium_amount: float
    payment_frequency: str
    gender: str

    class Config:
        extra = Extra.ignore 

@router.post("/calculate-payout")
def calculate_payout(data: PayoutRequest):
    if not payout_model:
        # Fallback calculation
        estimated_amount = round(data.claim_amount * 0.85, 2)
        return {"amount": estimated_amount, "status": "Estimated (Fallback)"}

    try:
        # 1. Convert to DataFrame
        input_dict = data.dict()
        
        # 2. Filter features: Remove only 'policy_id' and 'customer_id' 
        # if they were NOT part of your model training.
        # If your model was trained ONLY on the 19 health features, use this:
        features_for_ai = {k: v for k, v in input_dict.items() 
                           if k not in ["policy_id", "customer_id", "claim_amount"]}
        
        df = pd.DataFrame([features_for_ai])

        # 3. Predict
        prediction = payout_model.predict(df)
        final_amount = round(float(prediction[0]), 2)

        return {
            "amount": final_amount,
            "policy_id": data.policy_id,
            "status": "AI_Calculated"
        }
    except Exception as e:
        print(f"Internal Error: {e}")
        raise HTTPException(status_code=400, detail=f"AI Engine Error: {str(e)}")
