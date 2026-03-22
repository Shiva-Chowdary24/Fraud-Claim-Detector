# routers/predict.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime
from pathlib import Path
import os
import sys
import logging
import pandas as pd
import numpy as np
import joblib, json

from pymongo.collection import Collection
from pymongo import MongoClient, ASCENDING
from bson.objectid import ObjectId

# --- Make project root (BACKEND/) importable for features.py / reason_codes.py ---
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from features import engineer_features, apply_te_from_state
from utils.reason_codes import reason_sentences

# -------------------- LOGGER --------------------
logger = logging.getLogger("predict")
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

router = APIRouter(tags=["Prediction"])

# -------------------- ARTIFACT PATHS --------------------
HERE = Path(__file__).resolve().parent
ARTIFACTS_DIR = (HERE.parent / "artifacts")
MODEL_PATH = ARTIFACTS_DIR / "model.joblib"
THRESHOLD_PATH = ARTIFACTS_DIR / "threshold.json"

logger.info("[STARTUP] Loading model artifacts from %s", ARTIFACTS_DIR)

BUNDLE = None
THRESHOLD = {"threshold": 0.5}
TE_STATE = None

try:
    BUNDLE = joblib.load(MODEL_PATH)
    THRESHOLD = json.load(open(THRESHOLD_PATH, "r", encoding="utf-8"))
    TE_STATE = BUNDLE.get("te_state", BUNDLE.get("target_encoder_state"))
    logger.info("[STARTUP] Artifacts loaded. Features: %s", BUNDLE.get("features"))
except Exception as e:
    logger.exception("⚠️ Prediction artifacts failed to load: %r", e)

# -------------------- MONGO CONNECTION --------------------
MONGO_URI = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "Insurancedb")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
dealers: Collection = db["Dealer_Data"]
insurance_col: Collection = db["Insurance"] # ✅ Ensure this matches your collection name
fraud_logs: Collection = db["Fraud_Logs"]
fraud_logs.create_index([("Policy_id", ASCENDING)], name="ix_policy_id")

# -------------------- HELPERS --------------------
def now_utc_iso() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"

# -------------------- SCHEMAS --------------------
class PredictIn(BaseModel):
    Policy_id: Optional[str] = Field(default=None, description="Policy identifier")
    customer_id: Optional[str] = Field(default=None, description="The 6-digit Customer ID") # ✅ ADDED

    policy_start_date: str
    incident_date: str
    report_date: str

    annual_premium: float
    deductible: float
    claim_amount: float

    payment_method: Literal["Cash", "Crypto", "Bank"]
    channel: Literal["Agent", "Online"]
    police_reported: Literal["Yes", "No"]
    injury_severity: Literal["None", "Normal", "Critical", "Major"]

    num_prior_claims: int

class PredictOut(BaseModel):
    fraud_prediction: int
    fraud_probability: float
    Policy_id: str
    reason_sentences: str

# -------------------- PREDICTION --------------------
@router.post("/predict", response_model=PredictOut)
def predict(data: PredictIn, request: Request) -> Dict[str, Any]:
    if BUNDLE is None or "model" not in BUNDLE:
        raise HTTPException(status_code=500, detail="Model artifacts not loaded")

    cid = request.headers.get("x-request-id", str(ObjectId()))
    logger.info("[PREDICT][%s] Processing Request", cid)

    try:
        # ---- 1. NORMALIZE PAYLOAD ----
        raw = data.model_dump()
        policy_id = raw.get("Policy_id") or "UNKNOWN"
        customer_id = raw.get("customer_id")

        # ✅ CRITICAL FIX: BACKUP LOOKUP
        # If the frontend didn't send customer_id, we find it in the Insurance DB via Policy_id
        if not customer_id and policy_id != "UNKNOWN":
            user_record = insurance_col.find_one({"policy_id": policy_id})
            if user_record:
                customer_id = user_record.get("customer_id")

        # ---- 2. BUILD DATAFRAME & ENGINEER FEATURES ----
        df = pd.DataFrame([raw])
        df_eng = engineer_features(df)
        df_te = apply_te_from_state(df_eng, TE_STATE)

        required_feats = BUNDLE["features"]
        for col in required_feats:
            if col not in df_te.columns:
                df_te[col] = np.nan

        # ---- 3. PREDICT ----
        X_imp = BUNDLE["imputer"].transform(df_te[required_feats])
        proba = float(BUNDLE["model"].predict_proba(X_imp)[0][1])
        threshold = float(THRESHOLD.get("threshold", 0.5))
        pred = int(proba >= threshold)

        # ---- 4. REASONS ----
        reasons_text = reason_sentences(df_eng.iloc[0])

        logger.info("[PREDICT][%s] Result: pred=%s | proba=%.4f | policy=%s", cid, pred, proba, policy_id)

        # ---- 5. LOG TO MONGODB (INCLUDING CUSTOMER_ID) ----
        if pred == 1:
            fraud_logs.update_one(
                {"Policy_id": policy_id},
                {
                    "$set": {
                        "Policy_id": policy_id,
                        "customer_id": str(customer_id) if customer_id else "UNKNOWN", # ✅ FIXED: Saved here!
                        "probability": proba,
                        "reasons": reasons_text,
                        "timestamp": now_utc_iso(),
                        "class": 1, # Used by Admin filter
                        "status": "Pending" 
                    }
                },
                upsert=True,
            )
            logger.info("[FRAUD_DETECTED] Logged for Customer: %s", customer_id)

        return {
            "fraud_prediction": pred,
            "fraud_probability": proba,
            "Policy_id": policy_id,
            "reason_sentences": reasons_text,
        }

    except Exception as e:
        logger.exception("[PREDICT][%s] Error: %r", cid, e)
        raise HTTPException(status_code=400, detail="Prediction logic failed")
