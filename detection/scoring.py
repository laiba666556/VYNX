def calculate_final_score(base_score: int, ai_delta: int = 0, hard_veto: bool = False) -> int:
    """
    Calculates the final risk score using the Evidence Fusion formula.
    
    - If hard_veto is True, instantly returns 100 (AI cannot override).
    - Otherwise, adds the AI delta (-20 to +20) to the base score.
    - Clamps the final result strictly between 0 and 100.
    """
    if hard_veto:
        return 100
    
    final_score = base_score + ai_delta
    
    # Clamp between 0 and 100
    return max(0, min(100, final_score))


def get_verdict_and_level(score: int) -> tuple[str, str]:
    """
    Maps the final risk score (0-100) to a specific verdict and risk level.
    """
    if score <= 25:
        return "SAFE", "LOW"
    elif score <= 50:
        return "SPAM", "MEDIUM"
    elif score <= 75:
        return "SUSPICIOUS", "HIGH"
    else:
        return "PHISHING", "CRITICAL"