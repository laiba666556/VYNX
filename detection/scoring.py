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


def calculate_confidence(signals: list, ai_available: bool, base_score: int, ai_delta: int) -> float:
    """
    Calculate confidence in the assessment based on available evidence.
    - 0.8+ when rule signals and AI agree on risk direction
    - 0.5-0.8 when only one source has evidence
    - Below 0.5 when evidence is thin or conflicting
    """
    # If no signals and AI is not available, confidence is low
    if not signals and not ai_available:
        return 0.1  # Very low confidence when no evidence
    
    # Determine if there's substantial evidence from rules
    has_rule_evidence = len(signals) > 0 or base_score > 0
    
    # Determine if AI contributed meaningful information
    has_ai_evidence = ai_available and ai_delta != 0
    
    # Determine risk directions
    rule_risk_direction = "positive" if base_score > 25 else ("negative" if base_score < 10 else "neutral")
    ai_risk_direction = "positive" if ai_delta > 5 else ("negative" if ai_delta < -5 else "neutral")
    
    # High confidence when both sources agree on risk direction
    if has_rule_evidence and has_ai_evidence and rule_risk_direction == ai_risk_direction and rule_risk_direction != "neutral":
        return 0.9  # High confidence when both agree
    
    # Medium-high confidence when both sources active but maybe not fully aligned
    if has_rule_evidence and has_ai_evidence:
        return 0.7
    
    # Medium confidence when only one source has evidence
    if has_rule_evidence or has_ai_evidence:
        return 0.6
    
    # Low-medium confidence when minimal evidence
    return 0.4


def get_verdict_and_level_and_action(score: int, signals: list, ai_available: bool) -> tuple[str, str, str]:
    """
    Maps the final risk score (0-100) to a specific verdict, risk level, and recommended action.
    Includes the new UNKNOWN verdict when zero signals triggered AND the AI is unavailable.
    """
    # Check for UNKNOWN case: no signals and AI unavailable
    if not signals and not ai_available:
        return "UNKNOWN", "LOW", "Not enough evidence — verify through official channels before acting."
    
    # Standard verdict mapping
    if score <= 25:
        return "SAFE", "LOW", "Safe to interact"
    elif score <= 50:
        return "SPAM", "MEDIUM", "Ignore and delete"
    elif score <= 75:
        return "SUSPICIOUS", "HIGH", "Do not click links; verify the sender through official channels"
    else:
        return "PHISHING", "CRITICAL", "Do not respond. Report and delete immediately."