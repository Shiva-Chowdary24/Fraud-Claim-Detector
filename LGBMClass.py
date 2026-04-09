import os, json, joblib, sys
import numpy as np
import pandas as pd
from datetime import datetime

# (Optional) Silence loky "physical cores" warning on Windows where WMIC is missing
# os.environ["LOKY_MAX_CPU_COUNT"] = "8"   # set to your logical core count, e.g., 8

from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    classification_report, roc_auc_score, average_precision_score,
    precision_recall_curve, confusion_matrix
)
from sklearn.calibration import CalibratedClassifierCV

# Try LightGBM; fallback to scikit-learn HGB if not present
USE_LGBM = True
try:
    from lightgbm import LGBMClassifier
except Exception:
    USE_LGBM = False
    from sklearn.ensemble import HistGradientBoostingClassifier

# ----------------------------- CONFIG -----------------------------
CSV_PATH = r"C:/Users/manda.shiva/Downloads/fraud_detect/backend/insurance_fraud_synthetic_1m.csv"
ARTIFACT_DIR = os.path.join(os.path.dirname(CSV_PATH), "artifacts")
os.makedirs(ARTIFACT_DIR, exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE = 0.20
SMOOTH_M = 50.0       # smoothing for target encoding
CALIB_CV = 3          # CV folds for isotonic calibration

# ------------------------- UTILITIES ------------------------------
def ensure_dates(df, cols):
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_datetime(df[c], errors="coerce")

def safe_div(a, b, min_den=1.0):
    return a / np.clip(b, min_den, None)

def clip_series(s, lower_q=None, upper_q=0.999):
    if lower_q is None and upper_q is None:
        return s
    s = s.copy()
    if lower_q is not None:
        lo = np.nanquantile(s, lower_q)
        s = np.maximum(s, lo)
    if upper_q is not None:
        hi = np.nanquantile(s, upper_q)
        s = np.minimum(s, hi)
    return s

# ------------------ Smoothed Target Encoding ----------------------
class SmoothedTargetEncoder:
    """
    Smoothed target encoder for binary targets.
    enc(cat) = (count*mean + m*prior) / (count + m)
    """
    def __init__(self, cols, m=50.0):
        self.cols = cols
        self.m = float(m)
        self.prior_ = None
        self.maps_ = {}

    def fit(self, X: pd.DataFrame, y: pd.Series):
        y = y.astype(int)
        self.prior_ = y.mean()
        for c in self.cols:
            if c not in X.columns:
                continue
            s = X[c].astype(str).fillna("__NA__")
            grp = pd.DataFrame({"c": s, "y": y}).groupby("c")["y"].agg(["mean","count"])
            enc = (grp["mean"] * grp["count"] + self.m * self.prior_) / (grp["count"] + self.m)
            enc.name = c
            self.maps_[c] = enc
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X = X.copy()
        for c in self.cols:
            if c not in X.columns:
                X[f"te_{c}"] = self.prior_
                continue
            s = X[c].astype(str).fillna("__NA__")
            mapping = self.maps_.get(c, None)
            if mapping is None:
                X[f"te_{c}"] = self.prior_
            else:
                X[f"te_{c}"] = s.map(mapping).fillna(self.prior_).astype(float)
        return X

    def get_state(self):
        state = {"prior": self.prior_, "m": self.m, "cols": self.cols, "maps": {}}
        for c, enc in self.maps_.items():
            state["maps"][c] = enc.to_dict()
        return state

# -------------------- Feature Engineering -------------------------
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    ensure_dates(df, ["policy_start_date","incident_date","report_date"])

    # Time deltas
    df["days_to_report"] = (df["report_date"] - df["incident_date"]).dt.days
    df["policy_age_days_at_incident"] = (df["incident_date"] - df["policy_start_date"]).dt.days

    # Calendar
    df["incident_weekday"] = df["incident_date"].dt.weekday
    df["incident_month"]   = df["incident_date"].dt.month
    df["report_weekday"]   = df["report_date"].dt.weekday
    df["report_month"]     = df["report_date"].dt.month
    df["incident_hour"]    = pd.to_numeric(df.get("incident_hour", np.nan), errors="coerce")

    # Ratios
    df["claim_to_premium_ratio"]    = safe_div(df["claim_amount"], df["annual_premium"])
    df["deductible_to_claim_ratio"] = safe_div(df["deductible"], df["claim_amount"])
    df["premium_per_month"]         = safe_div(df["annual_premium"], np.maximum(df.get("policy_tenure_months", 1), 1))
    df["prior_claim_rate"]          = safe_div(df.get("num_prior_claims", 0),
                                               (df.get("policy_tenure_months", 0) / 12.0 + 0.25))
    # Stabilize tails
    df["claim_to_premium_ratio"]    = clip_series(df["claim_to_premium_ratio"], upper_q=0.999)
    df["deductible_to_claim_ratio"] = clip_series(df["deductible_to_claim_ratio"], upper_q=0.999)

    # Behavioral flags
    df["is_new_policy_90d"]  = (df["policy_age_days_at_incident"] <= 90).astype("Int8")
    df["is_late_report_14d"] = (df["days_to_report"] > 14).astype("Int8")
    df["is_online"]          = (df.get("channel","").astype(str).str.lower() == "online").astype("Int8")
    df["is_cash_or_crypto"]  = df.get("payment_method","").isin(["Cash","Crypto"]).astype("Int8")

    # Police & injury
    df["police_reported_flag"] = df.get("police_reported","No").astype(str).str.lower().isin(
        ["yes","y","true","1"]).astype("Int8")
    sev_map = {"Minor":0,"None":0,"Major":1,"Severe":1,"Critical":1}
    df["injury_severe_flag"] = df.get("injury_severity","None").map(sev_map).fillna(0).astype("Int8")

    # Ages
    current_year = datetime.now().year
    if "vehicle_year" in df.columns:
        df["vehicle_age"] = (current_year - pd.to_numeric(df["vehicle_year"], errors="coerce")).clip(lower=0)
    else:
        df["vehicle_age"] = np.nan
    if "home_year_built" in df.columns:
        df["property_age"] = (current_year - pd.to_numeric(df["home_year_built"], errors="coerce")).clip(lower=0)
    else:
        df["property_age"] = np.nan

    return df

def reason_codes(row: pd.Series):
    reasons = []
    if pd.notna(row.get("claim_to_premium_ratio")) and row["claim_to_premium_ratio"] > 25:
        reasons.append("HIGH_CLAIM_VS_PREMIUM")
    if pd.notna(row.get("days_to_report")) and row["days_to_report"] > 14:
        reasons.append("LATE_REPORT")
    if pd.notna(row.get("policy_age_days_at_incident")) and row["policy_age_days_at_incident"] <= 90:
        reasons.append("NEW_POLICY")
    if row.get("is_online", 0) == 1:
        reasons.append("ONLINE_CHANNEL")
    if row.get("is_cash_or_crypto", 0) == 1:
        reasons.append("CASH_OR_CRYPTO_PAYMENT")
    if row.get("police_reported_flag", 1) == 0:
        reasons.append("NO_POLICE_REPORT")
    if row.get("injury_severe_flag", 0) == 1:
        reasons.append("SEVERE_INJURY")
    return reasons

# -------------------------- LOAD DATA -----------------------------
if not os.path.exists(CSV_PATH):
    print(f"[ERROR] CSV not found: {CSV_PATH}")
    sys.exit(1)

df = pd.read_csv(CSV_PATH)

required = {"policy_start_date","incident_date","report_date","annual_premium","deductible","claim_amount","fraud"}
missing = required - set(df.columns)
if missing:
    raise ValueError(f"Dataset missing expected columns: {missing}")

# -------------------- FEATURE ENGINEERING ------------------------
df = engineer_features(df)

numeric_cols = [c for c in [
    "insured_age","num_prior_claims","policy_tenure_months","life_sum_assured",
    "annual_premium","deductible","claim_amount",
    "days_to_report","policy_age_days_at_incident",
    "incident_weekday","incident_month","report_weekday","report_month","incident_hour",
    "claim_to_premium_ratio","deductible_to_claim_ratio","premium_per_month","prior_claim_rate",
    "vehicle_age","property_age",
    "is_new_policy_90d","is_late_report_14d","is_online","is_cash_or_crypto",
    "police_reported_flag","injury_severe_flag"
] if c in df.columns]

cat_cols = [c for c in [
    "policy_type","coverage_type","customer_segment","channel","payment_method","geo_region",
    "property_type","diagnosis_group","provider_specialty","life_product",
    "vehicle_make","vehicle_model","injury_severity","police_reported"
] if c in df.columns]

y = df["fraud"].astype(int).values
X_all = df[numeric_cols + cat_cols].copy()

# Train/test split
X_train_full, X_test, y_train_full, y_test = train_test_split(
    X_all, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
)

# Target encoding on train_full
te = SmoothedTargetEncoder(cols=cat_cols, m=SMOOTH_M).fit(X_train_full, pd.Series(y_train_full))
X_train_full_te = te.transform(X_train_full)
X_test_te       = te.transform(X_test)

te_cols = [f"te_{c}" for c in cat_cols]
features = numeric_cols + te_cols

# Impute
imp = SimpleImputer(strategy="median")
X_train_full_imp = imp.fit_transform(X_train_full_te[features])
X_test_imp       = imp.transform(X_test_te[features])

# Imbalance weights on the full training fold used for calibration CV
pos = max(int((y_train_full == 1).sum()), 1)
neg = max(int((y_train_full == 0).sum()), 1)
scale_pos_weight = neg / pos
sample_weight_full = np.where(y_train_full==1, scale_pos_weight, 1.0)

# ----------------------- BASE ESTIMATOR --------------------------
if USE_LGBM:
    base_est = LGBMClassifier(
        num_leaves=64,
        learning_rate=0.05,
        n_estimators=600,
        max_depth=-1,
        subsample=0.9,
        colsample_bytree=0.8,
        reg_lambda=1.0,
        random_state=RANDOM_STATE,
        scale_pos_weight=scale_pos_weight
    )
else:
    base_est = HistGradientBoostingClassifier(
        learning_rate=0.07,
        max_depth=None,
        max_iter=500,
        l2_regularization=0.0,
        random_state=RANDOM_STATE
    )

# ------------------ ISOTONIC CALIBRATION with CV -----------------
# IMPORTANT: Do NOT prefit. Let CalibratedClassifierCV refit the estimator across CV folds.
cal = CalibratedClassifierCV(estimator=base_est, method="isotonic", cv=CALIB_CV)
cal.fit(X_train_full_imp, y_train_full, sample_weight=sample_weight_full)

# -------------------------- EVALUATION ---------------------------
proba = cal.predict_proba(X_test_imp)[:, 1]
roc = roc_auc_score(y_test, proba)
pr_auc = average_precision_score(y_test, proba)

prec, rec, thr = precision_recall_curve(y_test, proba)
f1 = 2*prec*rec/(prec+rec+1e-12)
best_idx = int(np.argmax(f1))
thr_f1 = float(thr[best_idx]) if len(thr) else 0.5

# Alternative operating thresholds
target_recall = 0.70
idx = np.where(rec >= target_recall)[0]
thr_recall = float(thr[idx[0]]) if len(idx)>0 else thr_f1

k = 0.05
thr_topk = float(np.quantile(proba, 1 - k))

def report_at_threshold(name, t):
    pred = (proba >= t).astype(int)
    print(f"\n== {name} @ threshold={t:.4f} ==")
    print(classification_report(y_test, pred, digits=4))
    print("ROC-AUC:", round(roc,4))
    print("PR-AUC:", round(pr_auc,4))
    print("Confusion matrix:\n", confusion_matrix(y_test, pred))

report_at_threshold("Best F1",       thr_f1)
report_at_threshold("Recall≥70%",    thr_recall)
report_at_threshold("Top-7% workload", thr_topk)

OPERATING_THRESHOLD = thr_f1  # choose default (or switch to thr_topk/thr_recall)

# --------------------------- SAVE ARTIFACTS ----------------------
bundle = {
    "model": cal,                       # calibrated model
    "imputer": imp,
    "features": features,
    "te_state": te.get_state(),
    "numeric_cols": numeric_cols,
    "cat_cols": cat_cols
}
joblib.dump(bundle, os.path.join(ARTIFACT_DIR, "model.joblib"))
with open(os.path.join(ARTIFACT_DIR, "threshold.json"), "w") as f:
    json.dump({"threshold": float(OPERATING_THRESHOLD),
               "roc_auc": float(roc),
               "pr_auc": float(pr_auc),
               "mode": "best_f1"}, f, indent=2)

# ---------------- BUILT-IN SAMPLE PREDICTIONS --------------------
sample_clean = {
    "policy_start_date": "2018-04-15",
    "incident_date":     "2025-11-10",
    "report_date":       "2025-11-11",
    "annual_premium":    2400.0,
    "deductible":         500.0,
    "claim_amount":      1200.0,
    "insured_age":         52,
    "num_prior_claims":     0,
    "policy_tenure_months": 90,
    "channel":           "Agent",
    "payment_method":    "Bank",
    "police_reported":   "Yes",
    "injury_severity":   "None",
    "vehicle_year":      2018,
    "home_year_built":   1995
}

sample_fraud_unique = {
    "policy_start_date": "2026-01-05",
    "incident_date":     "2026-02-01",
    "report_date":       "2026-03-05",   # late
    "annual_premium":     950.0,
    "deductible":         500.0,
    "claim_amount":     42000.0,         # very high vs premium
    "insured_age":         31,
    "num_prior_claims":     4,
    "policy_tenure_months": 1,
    "channel":           "Online",
    "payment_method":    "Crypto",
    "police_reported":   "No",
    "injury_severity":   "None",
    "vehicle_year":      None,
    "home_year_built":   1962
}

samples_raw = pd.DataFrame([sample_clean, sample_fraud_unique])

# FE + apply TE state
def apply_te_from_state(df_eng, te_state):
    df_eng = df_eng.copy()
    prior = te_state["prior"]; te_cols_saved = te_state["cols"]; maps = te_state["maps"]
    for c in te_cols_saved:
        if c in df_eng.columns:
            s = df_eng[c].astype(str).fillna("__NA__")
        else:
            s = pd.Series(["__NA__"]*len(df_eng))
        mapping = maps.get(c, {})
        df_eng[f"te_{c}"] = s.map(mapping).fillna(prior).astype(float)
    return df_eng

samples_eng = engineer_features(samples_raw)
samples_te  = apply_te_from_state(samples_eng, bundle["te_state"])

# Ensure all features exist
for col in features:
    if col not in samples_te.columns:
        samples_te[col] = np.nan

Xs_imp = bundle["imputer"].transform(samples_te[features])
s_proba = bundle["model"].predict_proba(Xs_imp)[:, 1]
s_pred  = (s_proba >= OPERATING_THRESHOLD).astype(int)

print("\n===== SAMPLE PREDICTIONS =====")
for i, row in samples_eng.iterrows():
    print(("[CLEAN] " if i==0 else "[FRAUDY]"),
          f"proba={s_proba[i]:.4f}, pred={int(s_pred[i])}, reasons={reason_codes(row)}")

out_sample = os.path.join(ARTIFACT_DIR, "sample_predictions_improved.csv")
out_df = samples_raw.copy()
out_df["proba"] = s_proba
out_df["pred"]  = s_pred
out_df["reasons"] = [reason_codes(samples_eng.iloc[i]) for i in range(len(samples_eng))]
out_df.to_csv(out_sample, index=False)

print(f"\nArtifacts saved to: {ARTIFACT_DIR}")
print(f"Sample predictions saved to: {out_sample}")
