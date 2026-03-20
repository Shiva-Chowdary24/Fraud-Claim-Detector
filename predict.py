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
from reason_codes import reason_sentences

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
    BUNDLE = joblib.load(MODEL_PATH)  # expects keys: model, imputer, features, te_state
    THRESHOLD = json.load(open(THRESHOLD_PATH, "r", encoding="utf-8"))
    TE_STATE = BUNDLE.get("te_state", BUNDLE.get("target_encoder_state"))
    logger.info("[STARTUP] Artifacts loaded. Features: %s", BUNDLE.get("features"))
except Exception as e:
    logger.exception("⚠️  Prediction artifacts failed to load: %r", e)

# -------------------- MONGO CONNECTION --------------------
MONGO_URI = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "Insurancedb")

logger.info("[STARTUP] Connecting to MongoDB %s DB=%s", MONGO_URI, DB_NAME)
client = MongoClient(MONGO_URI)

try:
    client.admin.command("ping")
    logger.info("[STARTUP] Mongo connected. Address: %s", client.address)
except Exception as e:
    logger.exception("[STARTUP][ERROR] Mongo ping failed: %r", e)

db = client[DB_NAME]
dealers: Collection = db["Dealer_Data"]
customers: Collection = db["Insurance"]
fraud_logs: Collection = db["Fraud_Logs"]
fraud_logs.create_index([("Policy_id", ASCENDING)], name="ix_policy_id")

# -------------------- HELPERS --------------------
def now_utc_iso() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"

# -------------------- SCHEMAS --------------------
class PredictIn(BaseModel):
    Policy_id: Optional[str] = Field(default=None, description="Policy identifier for logging")

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
    reason_sentences: str  # <-- sentences only

# -------------------- DIAGNOSTICS --------------------
@router.get("/predict/health")
def predict_health():
    return {
        "artifacts_dir": str(ARTIFACTS_DIR),
        "model_path_exists": MODEL_PATH.exists(),
        "threshold_path_exists": THRESHOLD_PATH.exists(),
        "bundle_loaded": BUNDLE is not None,
        "has_model": (BUNDLE is not None) and ("model" in BUNDLE),
        "has_imputer": (BUNDLE is not None) and ("imputer" in BUNDLE),
        "has_features": (BUNDLE is not None) and ("features" in BUNDLE),
        "features_count": (len(BUNDLE.get("features", [])) if BUNDLE else 0),
        "has_te_state": TE_STATE is not None,
        "threshold": float(THRESHOLD.get("threshold", 0.5)),
    }

# -------------------- PREDICTION --------------------
@router.post("/predict", response_model=PredictOut)
def predict(data: PredictIn, request: Request) -> Dict[str, Any]:
    if BUNDLE is None or "model" not in BUNDLE:
        raise HTTPException(status_code=500, detail="Model artifacts not loaded")

    cid = request.headers.get("x-request-id", str(ObjectId()))
    logger.info("[PREDICT][%s] Received payload", cid)

    try:
        # ---- Normalize payload first (Policy vs Policy_id etc.) ----
        raw = data.model_dump()
        policy_id = (
            raw.get("Policy_id")
            or raw.get("Policy")
            or raw.get("policy_id")
            or raw.get("Policy ID")
            or raw.get("policyId")
        )
        if isinstance(policy_id, str):
            policy_id = policy_id.strip()
        if not policy_id:
            policy_id = "UNKNOWN"
        raw["Policy_id"] = policy_id

        # ---- Build DataFrame ----
        df = pd.DataFrame([raw])

        # ---- Feature engineering + target encoding ----
        df_eng = engineer_features(df)
        df_te = apply_te_from_state(df_eng, TE_STATE)

        # ---- Ensure model features ----
        required_feats = BUNDLE["features"]
        for col in required_feats:
            if col not in df_te.columns:
                df_te[col] = np.nan

        # ---- Predict ----
        X_imp = BUNDLE["imputer"].transform(df_te[required_feats])
        proba = float(BUNDLE["model"].predict_proba(X_imp)[0][1])
        threshold = float(THRESHOLD.get("threshold", 0.5))
        pred = int(proba >= threshold)

        # ---- Reasons (sentences paragraph only) ----
        reasons_text = reason_sentences(df_eng.iloc[0])

        logger.info(
            "[PREDICT][%s] proba=%.6f threshold=%.6f pred=%s policy=%s",
            cid, proba, threshold, pred, policy_id
        )

        # ---- Log only when fraud ----
        if pred == 1:
            fraud_logs.update_one(
                {"Policy_id": policy_id},
                {
                    "$set": {
                        "probability": proba,
                        "reasons": reasons_text,  # sentences only
                        "timestamp": now_utc_iso(),
                        "Policy_id": policy_id
                    }
                },
                upsert=True,
            )

        return {
            "fraud_prediction": pred,
            "fraud_probability": proba,
            "Policy_id": policy_id,
            "reason_sentences": reasons_text,
        }

    except Exception as e:
        logger.exception("[PREDICT][%s] Error during prediction: %r", cid, e)
        if os.getenv("DEBUG_PREDICT") == "1":
            raise HTTPException(status_code=400, detail=f"Predict error: {repr(e)}")
        raise HTTPException(status_code=400, detail="Failed to compute prediction")