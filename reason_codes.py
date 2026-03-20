# reason_codes.py

def reason_sentences(row) -> str:
    """
    Build a single paragraph of human-readable reasons.
    Returns one string (no codes).
    """
    parts = []

    def _num(x, default=None):
        try:
            return float(x)
        except Exception:
            return default

    claim_ratio = _num(row.get("claim_to_premium_ratio"))
    if claim_ratio is not None and claim_ratio > 25:
        parts.append("The claim amount is disproportionately high compared to the annual premium.")

    days_to_report = _num(row.get("days_to_report"))
    if days_to_report is not None and days_to_report > 14:
        parts.append("The claim was reported more than 14 days after the incident.")

    policy_age = _num(row.get("policy_age_days_at_incident"))
    if policy_age is not None and policy_age <= 90:
        parts.append("The incident occurred within 90 days of the policy start, indicating a new policy.")

    if _num(row.get("is_online", 0), 0) == 1:
        parts.append("The claim was filed through an online channel.")

    if _num(row.get("is_cash_or_crypto", 0), 0) == 1:
        parts.append("The payment method used was cash or cryptocurrency.")

    if _num(row.get("police_reported_flag", 1), 1) == 0:
        parts.append("No police report was filed for the incident.")

    if _num(row.get("injury_severe_flag", 0), 0) == 1:
        parts.append("The claim involves severe injuries.")

    # If you want a space between sentences, use " ".join(parts)
    return " ".join(parts) if parts else "No specific reason identified."