import joblib
import os
import pandas as pd
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Extra
from pymongo import MongoClient

router = APIRouter(tags=["Payout Estimation"])

# --- MONGODB SETUP ---
client = MongoClient("mongodb://localhost:27017")
db = client["Insurancedb"]
rejected_claims = db["Failed_Claims"]

# --- LOAD MODELS ---
try:
    approval_model = joblib.load("models/approval_calibrated.pkl")
    amount_model = joblib.load("models/amount_model.pkl")
    print("✅ Models Loaded: Approval (Calibrated) & Amount")
except Exception as e:
    print(f"❌ Model loading failed: {e}")
    approval_model = None
    amount_model = None

# --- SCHEMA (IDs UPDATED TO INT) ---
class PayoutRequest(BaseModel):
    policy_id: int        # ✅ Changed to int
    customer_id: int      # ✅ Changed to int
    claim_amount: float
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
    payment_frequency: str
    gender: str

    class Config:
        extra = Extra.allow

# --- HARD REJECTION RULES ---
def hard_reject_rules(data: dict):
    reasons = []
    if data.get("policy_tenure_years", 0) < 0.5:
        reasons.append("Policy tenure too short")
    if data.get("prior_claims_count", 0) >= 3:
        reasons.append("Too many prior claims")
    if data.get("incident_severity") == "High" and data.get("region_risk_level") == "High":
        reasons.append("High severity claim in high risk region")
    if data.get("health_risk_score", 0) >= 5:
        reasons.append("Very high health risk score")
    if data.get("smoker") == 1 and data.get("diabetes") == 1:
        reasons.append("Smoker with chronic illness")
    return reasons

# --- PREDICTION API ---
@router.post("/predict-health")
def predict_health(data: PayoutRequest):
    if not approval_model or not amount_model:
        raise HTTPException(status_code=500, detail="Inference models not available")

    try:
        input_dict = data.dict()
        policy_id = input_dict.get("policy_id")

        # 1️⃣ PHASE 1: HARD RULE CHECK
        reasons = hard_reject_rules(input_dict)
        if reasons:
            result = {
                "policy_id": policy_id, 
                "approved": "No", 
                "amount": 0.0, 
                "reasons": reasons
            }
            # Log rejected claim to MongoDB
            rejected_claims.insert_one({
                "policy_id": policy_id,
                "input": input_dict,
                "rejected_by": "RULES",
                "timestamp": datetime.utcnow()
            })
            return result

        # 2️⃣ PHASE 2: ML PREPARATION
        # Exclude IDs and the requested amount from the features used by the ML model
        features = {k: v for k, v in input_dict.items() 
                    if k not in ["policy_id", "customer_id", "claim_amount"]}
        
        df = pd.DataFrame([features])
        
        # 3️⃣ PHASE 3: ML APPROVAL CHECK
        approval_prob = float(approval_model.predict_proba(df)[0, 1])

        if approval_prob < 0.5:
            result = {
                "policy_id": policy_id,
                "approved": "No",
                "amount": 0.0,
                "probability": round(approval_prob, 4),
                "reasons": ["Low ML approval probability"]
            }
            rejected_claims.insert_one({
                "policy_id": policy_id,
                "input": input_dict,
                "rejected_by": "ML",
                "probability": approval_prob,
                "timestamp": datetime.utcnow()
            })
            return result

        # 4️⃣ PHASE 4: AMOUNT PREDICTION (ONLY IF APPROVED)
        prediction = amount_model.predict(df)
        final_amount = round(float(prediction[0]), 2)

        return {
            "policy_id": policy_id,
            "approved": "Yes",
            "amount": final_amount,
            "probability": round(approval_prob, 4),
            "status": "AI_Calculated"
        }

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=400, detail=f"Inference Error: {str(e)}")
