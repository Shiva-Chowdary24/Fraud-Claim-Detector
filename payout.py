# routes/payout.py

import joblib
import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["Payout Estimation"])

# Load model (optional)
MODEL_PATH = os.path.join("artifacts", "amount_model.joblib")

try:
    model = joblib.load(MODEL_PATH)
    print("✅ Model Loaded")
except:
    model = None
    print("⚠️ Using fallback logic")


# ✅ SIMPLE SCHEMA (MATCHES FRONTEND)
class PayoutRequest(BaseModel):
    policy_id: str
    customer_id: str
    claim_amount: float
    age: int | None = 0


@router.post("/calculate-payout")
def calculate_payout(data: PayoutRequest):
    try:
        # ✅ If model exists
        if model:
            df = pd.DataFrame([{
                "age": data.age,
                "claim_amount": data.claim_amount
            }])
            pred = model.predict(df)[0]
            amount = round(float(pred), 2)

        else:
            # ✅ Fallback logic
            amount = round(data.claim_amount * 0.8, 2)

        return {
            "amount": amount,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
