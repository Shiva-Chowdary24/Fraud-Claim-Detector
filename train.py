# ============================================================
# Insurance Approval + Claimable Amount
# Modern sklearn-compatible (NO prefit)
# ============================================================

import os
import pandas as pd
import numpy as np

os.environ["LOKY_MAX_CPU_COUNT"] = "8"  # optional

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score, mean_absolute_error, brier_score_loss
from sklearn.calibration import CalibratedClassifierCV

from lightgbm import LGBMClassifier, LGBMRegressor

# ------------------------------------------------------------
# 1. Load data
# ------------------------------------------------------------
df = pd.read_csv("final_dataset_no_claim_columns.csv")

APPROVAL_TARGET = "probability_of_approval"
AMOUNT_TARGET = "claimable_amount"

X = df.drop(columns=[
    APPROVAL_TARGET,
    AMOUNT_TARGET,
    "policy_id",
    "policy_start_date",
    "policy_end_date"
])

y_app = df[APPROVAL_TARGET]
y_amt = df[AMOUNT_TARGET]

# ------------------------------------------------------------
# 2. Preprocessing (Pandas-safe)
# ------------------------------------------------------------
cat_cols = X.select_dtypes(include=["object", "string"]).columns.tolist()
num_cols = X.select_dtypes(exclude=["object", "string"]).columns.tolist()

preprocess = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
    ("num", "passthrough", num_cols)
])

# ------------------------------------------------------------
# 3. Train / Test split
# ------------------------------------------------------------
X_train, X_test, y_app_train, y_app_test, y_amt_train, y_amt_test = train_test_split(
    X, y_app, y_amt, test_size=0.2, random_state=42
)

# ------------------------------------------------------------
# 4. BASE approval pipeline (UNFITTED)
# ------------------------------------------------------------
base_approval_pipeline = Pipeline([
    ("prep", preprocess),
    ("model", LGBMClassifier(
        n_estimators=300,
        learning_rate=0.05,
        class_weight="balanced",
        random_state=42
    ))
])

# ------------------------------------------------------------
# 5. Platt Calibration (CORRECT for sklearn >=1.4)
# ------------------------------------------------------------
platt_calibrator = CalibratedClassifierCV(
    estimator=base_approval_pipeline,
    method="sigmoid",
    cv=5,              # ✅ REQUIRED
    n_jobs=-1
)

platt_calibrator.fit(X_train, y_app_train)

platt_probs = platt_calibrator.predict_proba(X_test)[:, 1]

print("Approval ROC-AUC (Platt):",
      roc_auc_score(y_app_test, platt_probs))
print("Brier Score (Platt):",
      brier_score_loss(y_app_test, platt_probs))

# ------------------------------------------------------------
# 6. Claimable Amount Model
# ------------------------------------------------------------
amount_model = Pipeline([
    ("prep", preprocess),
    ("model", LGBMRegressor(
        n_estimators=300,
        learning_rate=0.05,
        random_state=42
    ))
])

amount_model.fit(X_train, y_amt_train)

amount_preds = amount_model.predict(X_test)
print("Claimable Amount MAE:",
      mean_absolute_error(y_amt_test, amount_preds))

# ------------------------------------------------------------
# 7. FINAL PREDICTION FUNCTION
# ------------------------------------------------------------
def predict_policy(input_df, threshold=0.5):
    prob = platt_calibrator.predict_proba(input_df)[0, 1]

    if prob < threshold:
        return {
            "approved": "No",
            "approval_probability": round(float(prob), 4),
            "claimable_amount": 0.0
        }

    amount = amount_model.predict(input_df)[0]

    return {
        "approved": "Yes",
        "approval_probability": round(float(prob), 4),
        "claimable_amount": round(float(amount), 2)
    }
import os
import joblib

# ------------------------------------------------------------
# 8. SAVE TRAINED MODELS (THIS WAS MISSING ✅)
# ------------------------------------------------------------

os.makedirs("models", exist_ok=True)

joblib.dump(platt_calibrator, "models/approval_calibrated.pkl")
joblib.dump(amount_model, "models/amount_model.pkl")

print("✅ Models saved successfully:")
print(" - models/approval_calibrated.pkl")
print(" - models/amount_model.pkl")