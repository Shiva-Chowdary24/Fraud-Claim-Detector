# features.py
import pandas as pd
import numpy as np

DATE_COLS = ["policy_start_date", "incident_date", "report_date"]

def _to_dt(series: pd.Series) -> pd.Series:
    # Parse dates robustly; return NaT if unparseable
    return pd.to_datetime(series, errors="coerce", utc=False)

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Derive engineered fields required by reason_sentences() from the raw PredictIn schema.
    Assumes the raw columns exist as per PredictIn.
    """
    out = df.copy()

    # --- Dates ---
    for c in DATE_COLS:
        if c in out.columns:
            out[c] = _to_dt(out[c])

    # days_to_report: report_date - incident_date
    if {"report_date", "incident_date"}.issubset(out.columns):
        delta = (out["report_date"] - out["incident_date"]).dt.days
        out["days_to_report"] = delta.replace([np.inf, -np.inf], np.nan)
    else:
        out["days_to_report"] = np.nan

    # policy_age_days_at_incident: incident_date - policy_start_date
    if {"incident_date", "policy_start_date"}.issubset(out.columns):
        delta = (out["incident_date"] - out["policy_start_date"]).dt.days
        out["policy_age_days_at_incident"] = delta.replace([np.inf, -np.inf], np.nan)
    else:
        out["policy_age_days_at_incident"] = np.nan

    # claim_to_premium_ratio
    denom = out.get("annual_premium", np.nan)
    numer = out.get("claim_amount", np.nan)
    denom_safe = denom.replace(0, 1e-6) if isinstance(denom, pd.Series) else 1e-6
    out["claim_to_premium_ratio"] = numer / denom_safe

    # channel -> is_online
    out["is_online"] = (out.get("channel", "").astype(str).str.strip().str.lower() == "online").astype(int)

    # payment_method -> is_cash_or_crypto
    pm = out.get("payment_method", "").astype(str).str.strip().str.lower()
    out["is_cash_or_crypto"] = pm.isin(["cash", "crypto"]).astype(int)

    # police_reported -> police_reported_flag (1=yes, 0=no)
    pr = out.get("police_reported", "").astype(str).str.strip().str.lower()
    out["police_reported_flag"] = (pr == "yes").astype(int)

    # injury_severity -> injury_severe_flag (1 if Critical/Major)
    sev = out.get("injury_severity", "").astype(str).str.strip().str.lower()
    out["injury_severe_flag"] = sev.isin(["critical", "major"]).astype(int)

    # Ensure numeric types where appropriate
    to_numeric_cols = [
        "annual_premium", "claim_amount", "deductible", "num_prior_claims",
        "claim_to_premium_ratio", "days_to_report", "policy_age_days_at_incident",
        "is_online", "is_cash_or_crypto", "police_reported_flag", "injury_severe_flag",
    ]
    for col in to_numeric_cols:
        if col in out.columns:
            out[col] = pd.to_numeric(out[col], errors="coerce")

    return out


def apply_te_from_state(df: pd.DataFrame, te_state) -> pd.DataFrame:
    """
    If your model needs target encoding or any saved-state encoding, apply here.
    If not required (because your model pipeline already handles encodings),
    you can return df unchanged or adapt as needed.
    """
    # Example no-op (keep if your bundle doesn't need TE here)
    return df