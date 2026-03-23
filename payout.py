# import joblib
# import os
# import pandas as pd
# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel

# router = APIRouter(tags=["Payout Estimation"])

# # --- LOAD MODEL ---
# PAYOUT_MODEL_PATH = os.path.join("artifacts", "amount_model.pkl")

# try:
#     payout_model = joblib.load(PAYOUT_MODEL_PATH)
#     print("✅ Health Payout Model Loaded")
# except Exception as e:
#     print(f"❌ Model loading failed: {e}")
#     payout_model = None


# # --- SCHEMA ---
# class PayoutRequest(BaseModel):
#     policy_id: str
#     customer_id: str
#     claim_amount: float

#     age: int
#     prior_claims_count: int
#     incident_severity: str
#     region_risk_level: str
#     bmi: float
#     bloodpressure: int
#     diabetes: int
#     hereditary_diseases: str
#     smoker: int
#     regular_ex: int
#     weight: int
#     health_risk_score: int
#     policy_coverage_details: str
#     payment_frequency: str
#     gender: str


# # --- API ---
# @router.post("/predict-health")
# def predict_health(data: PayoutRequest):

#     # ✅ inside function
#     if not payout_model:
#         raise HTTPException(status_code=500, detail="Model not loaded")

#     try:
#         # 1️⃣ Convert to dict
#         input_data = data.model_dump()

#         # 2️⃣ Remove non-model fields
#         features = {
#             k: v for k, v in input_data.items()
#             if k not in ["policy_id", "customer_id", "claim_amount"]
#         }

#         # 3️⃣ Convert to DataFrame
#         df = pd.DataFrame([features])

#         # 4️⃣ Align columns
#         required_cols = payout_model.named_steps["prep"].feature_names_in_

#         for col in required_cols:
#             if col not in df.columns:
#                 df[col] = 0

#         df = df[required_cols]

#         # 5️⃣ Predict
#         prediction = payout_model.predict(df)
#         amount = round(float(prediction[0]), 2)

#         return {
#             "amount": amount,
#             "policy_id": data.policy_id,
#             "status": "AI_Calculated"
#         }

#     except Exception as e:
#         print("ERROR:", e)
#         raise HTTPException(status_code=400, detail=f"Prediction Error: {str(e)}")

from fastapi import FastAPI, Query,APIRouter
import pandas as pd
from datetime import datetime
import joblib
from pymongo import MongoClient

# ------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------
router = APIRouter()

# ------------------------------------------------------------
# Load trained models
# ------------------------------------------------------------
approval_model = joblib.load("artifacts/approval_calibrated.pkl")
amount_model = joblib.load("artifacts/amount_model.pkl")

# ------------------------------------------------------------
# MongoDB connection (ONLY FOR REJECTED LOGS)
# ------------------------------------------------------------
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)

db = client["Insurancedb"]
rejected_claims = db["Failed_Claims"]

# ------------------------------------------------------------
# Hard rejection rules (GUARANTEED REJECT)
# ------------------------------------------------------------
def hard_reject_rules(data: dict):
    reasons = []

    if data.get("policy_tenure_years", 0) < 0.5:
        reasons.append("Policy tenure too short")

    if data.get("prior_claims_count", 0) >= 3:
        reasons.append("Too many prior claims")

    if (
        data.get("incident_severity") == "High"
        and data.get("region_risk_level") == "High"
    ):
        reasons.append("High severity claim in high risk region")

    if data.get("health_risk_score", 0) >= 5:
        reasons.append("Very high health risk score")

    if data.get("smoker") == 1 and data.get("diabetes") == 1:
        reasons.append("Smoker with chronic illness")

    return reasons

# ------------------------------------------------------------
# POST: Predict claim
# ------------------------------------------------------------
@router.post("/predict-health")
def predict_claim(data: dict):
    """
    Only REJECTED claims are stored in MongoDB.
    """

    policy_id = data.get("policy_id")

    # 1️⃣ HARD RULE CHECK
    rejection_reasons = hard_reject_rules(data)

    if rejection_reasons:
        result = {
            "policy_id": policy_id,
            "approved": "No",
            "approval_probability": 0.0,
            "claimable_amount": 0.0,
            "rejection_reasons": rejection_reasons
        }

        rejected_claims.insert_one({
            "policy_id": policy_id,
            "input": data,
            "prediction": result,
            "rejected_by": "RULES",
            "timestamp": datetime.utcnow()
        })

        return result

    # 2️⃣ ML CHECK
    model_input = data.copy()
    model_input.pop("policy_id", None)
 
    # ✅ ENSURE REQUIRED FEATURES EXIST
    if "premium_amount" not in model_input:
        model_input["premium_amount"]

    if approval_prob < 0.5:
        result = {
            "policy_id": policy_id,
            "approved": "No",
            "approval_probability": round(float(approval_prob), 4),
            "claimable_amount": 0.0,
            "rejection_reasons": ["Low ML approval probability"]
        }

        rejected_claims.insert_one({
            "policy_id": policy_id,
            "input": data,
            "prediction": result,
            "rejected_by": "ML",
            "timestamp": datetime.utcnow()
        })

        return result

    # 3️⃣ APPROVED (NO LOGGING)
    amount = amount_model.predict(input_df)[0]

    return {
        "policy_id": policy_id,
        "claimable_amount": round(float(amount), 2)
    }
