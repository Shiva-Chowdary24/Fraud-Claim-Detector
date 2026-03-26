from fastapi import APIRouter
import pandas as pd
from datetime import datetime
import joblib
from pymongo import MongoClient
 
router = APIRouter(tags=["Health Claim Prediction"])
 
# ------------------------------------------------------------
# Load models
# ------------------------------------------------------------
approval_model = joblib.load("artifacts/approval_calibrated.pkl")
amount_model = joblib.load("artifacts/amount_model.pkl")
 
# ------------------------------------------------------------
# MongoDB (only rejected cases)
# ------------------------------------------------------------
client = MongoClient("mongodb://localhost:27017")
db = client["Insurancedb"]
rejected_claims = db["Failed_Claims"]
 
# ------------------------------------------------------------
# Utility: align dataframe to model schema
# ------------------------------------------------------------
def align_df(df: pd.DataFrame, pipeline):
    """
    Align dataframe with the model's preprocessing pipeline.
    - Numeric columns -> 0
    - Categorical columns -> 'Unknown'
    """
    prep = pipeline.named_steps["prep"]
 
    numeric_cols = []
    categorical_cols = []
 
    for name, transformer, cols in prep.transformers_:
        if transformer == "drop":
            continue
        if name.lower().startswith("num"):
            numeric_cols.extend(cols)
        elif name.lower().startswith("cat"):
            categorical_cols.extend(cols)
 
    # Fill numeric
    for col in numeric_cols:
        if col not in df.columns:
            df[col] = 0
 
    # Fill categorical
    for col in categorical_cols:
        if col not in df.columns:
            df[col] = "Unknown"
        df[col] = df[col].astype(str)
 
    return df[numeric_cols + categorical_cols]
 
 
# ------------------------------------------------------------
# Rule-based rejection
# ------------------------------------------------------------
def hard_reject_rules(data: dict):
    reasons = []
 
    if float(data.get("policy_tenure_years", 0)) < 0.5:
        reasons.append("Policy tenure too short")
 
    if int(data.get("prior_claims_count", 0)) >= 3:
        reasons.append("Too many prior claims")
 
    if data.get("incident_severity") == "High" and data.get("region_risk_level") == "High":
        reasons.append("High severity claim in high risk region")
 
    if int(data.get("health_risk_score", 0)) >= 8:
        reasons.append("Very high health risk score")
 
    if int(data.get("smoker", 0)) == 1 and int(data.get("diabetes", 0)) == 1:
        reasons.append("Smoker with chronic illness")
 
    return reasons
 
 
# ------------------------------------------------------------
# Predict Endpoint
# ------------------------------------------------------------
@router.post("/predict-health")
def predict_claim(data: dict):
 
    policy_id = data.get("policy_id")
 
    # --------------------------------------------------------
    # Normalize financial inputs
    # --------------------------------------------------------
    sum_assured = float(data.get("sum_assured") or 0)
    premium_amount = float(
        data.get("premium_amount") or data.get("annual_premium") or 0
    )
 
    if sum_assured <= 0 or premium_amount <= 0:
        result = {
            "policy_id": policy_id,
            "approved": "No",
            "approval_probability": 0.0,
            "claimable_amount": 0.0,
            "rejection_reasons": ["Invalid financial policy data"]
        }
        rejected_claims.insert_one({
            "policy_id": policy_id,
            "input": data,
            "prediction": result,
            "rejected_by": "DATA",
            "timestamp": datetime.utcnow()
        })
        return result
 
    # --------------------------------------------------------
    # 1️⃣ Rule-based rejection
    # --------------------------------------------------------
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
 
    # --------------------------------------------------------
    # 2️⃣ Approval model
    # --------------------------------------------------------
    approval_input = {
        # numeric
        "age": int(data.get("age", 0)),
        "weight": int(data.get("weight", 0)),
        "policy_tenure_years": float(data.get("policy_tenure_years", 0)),
        "prior_claims_count": int(data.get("prior_claims_count", 0)),
        "bmi": float(data.get("bmi", 0)),
        "bloodpressure": int(data.get("bloodpressure", 0)),
        "health_risk_score": int(data.get("health_risk_score", 0)),
        "sum_assured": sum_assured,
        "premium_amount": premium_amount,
 
        # categorical
        "incident_severity": data.get("incident_severity", "Low"),
        "region_risk_level": data.get("region_risk_level", "Low"),
        "policy_coverage_details": data.get("policy_coverage_details", "Individual"),
        "payment_frequency": data.get("payment_frequency", "Annual"),
        "gender": data.get("gender", "Male"),
        "hereditary_diseases": data.get("hereditary_diseases", "None"),
 
        # numeric flags (IMPORTANT)
        "diabetes": int(data.get("diabetes", 0)),
        "smoker": int(data.get("smoker", 0)),
        "regular_ex": int(data.get("regular_ex", 0)),
    }
 
    approval_df = pd.DataFrame([approval_input])
    approval_df = align_df(approval_df, approval_model.estimator)
 
    approval_prob = float(approval_model.predict_proba(approval_df)[0, 1])
 
    if approval_prob < 0.5:
        result = {
            "policy_id": policy_id,
            "approved": "No",
            "approval_probability": round(approval_prob, 4),
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
 
    # --------------------------------------------------------
    # 3️⃣ Amount model
    # --------------------------------------------------------
    amount_input = {
        "age": int(data.get("age", 0)),
        "weight": int(data.get("weight", 0)),
        "policy_tenure_years": float(data.get("policy_tenure_years", 0)),
        "prior_claims_count": int(data.get("prior_claims_count", 0)),
        "bmi": float(data.get("bmi", 0)),
        "bloodpressure": int(data.get("bloodpressure", 0)),
        "health_risk_score": int(data.get("health_risk_score", 0)),
        "sum_assured": sum_assured,
        "premium_amount": premium_amount,
    }
 
    amount_df = pd.DataFrame([amount_input])
    amount_df = align_df(amount_df, amount_model)
 
    raw_amount = float(amount_model.predict(amount_df)[0])
 
    # clamp payout
    amount = max(0, raw_amount)
    amount = min(amount, sum_assured)
 
    return {
        "policy_id": policy_id,
        "approved": "Yes",
        "approval_probability": round(approval_prob, 4),
        "claimable_amount": round(amount, 2)
    }
