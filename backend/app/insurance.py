SUPPORTED_PROVIDERS = {
    "Aetna",
    "Blue Cross",
    "Cigna",
    "UnitedHealthcare",
    "Humana",
    "Kaiser Permanente",
    "Anthem",
    "Molina Healthcare",
    "Centene",
    "WellCare",
}


def check_eligibility(provider: str | None, member_id: str | None) -> str:
    """Simulates a call to an external insurance eligibility API."""
    if provider is None or member_id is None:
        return "self_pay"
    if provider not in SUPPORTED_PROVIDERS:
        return "inactive"
    if member_id.endswith("0"):
        return "inactive"
    return "active"
