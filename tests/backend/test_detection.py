import sys
import os
import pytest
import tempfile
import json

# Add the root VYNX directory to the path so Python can find the 'detection' folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from detection.rules import analyze_url, analyze_message
from detection.blacklist import check_blacklist
from detection.scoring import calculate_final_score, get_verdict_and_level_and_action, calculate_confidence
from backend.database import ScanHistoryDB


def test_safe_url():
    signals, score = analyze_url("https://www.google.com")
    assert score == 0
    assert len(signals) == 0

def test_suspicious_url():
    # IP host (+20) + keywords 'verify', 'account', 'login' (+30) = 50
    signals, score = analyze_url("http://192.168.1.1/verify-account-login")
    assert score == 50
    assert "IP address used as hostname" in signals

def test_hard_veto_override():
    # Base score 10, but hard veto is True -> must be 100
    final = calculate_final_score(base_score=10, ai_delta=0, hard_veto=True)
    assert final == 100

def test_ai_delta_clamping():
    # Base 90 + delta 20 = 110, should clamp to 100
    final = calculate_final_score(base_score=90, ai_delta=20)
    assert final == 100

def test_verdict_mapping():
    verdict, level, action = get_verdict_and_level_and_action(10, ["some_signal"], True)
    assert verdict == "SAFE"
    assert level == "LOW"
    assert action == "Safe to interact"
    
    verdict, level, action = get_verdict_and_level_and_action(30, ["some_signal"], True)
    assert verdict == "SPAM"
    assert level == "MEDIUM"
    assert action == "Ignore and delete"
    
    verdict, level, action = get_verdict_and_level_and_action(60, ["some_signal"], True)
    assert verdict == "SUSPICIOUS"
    assert level == "HIGH"
    assert action == "Do not click links; verify the sender through official channels"
    
    verdict, level, action = get_verdict_and_level_and_action(90, ["some_signal"], True)
    assert verdict == "PHISHING"
    assert level == "CRITICAL"
    assert action == "Do not respond. Report and delete immediately."

def test_unknown_verdict():
    # Test the UNKNOWN verdict when no signals and AI unavailable
    verdict, level, action = get_verdict_and_level_and_action(10, [], False)  # No signals, AI unavailable
    assert verdict == "UNKNOWN"
    assert level == "LOW"
    assert action == "Not enough evidence — verify through official channels before acting."

def test_confidence_calculation():
    # Test high confidence when both rule signals and AI agree
    confidence = calculate_confidence(["suspicious_link"], True, 60, 10)  # Both agree on risk
    assert confidence >= 0.8
    
    # Test medium confidence when only one source has evidence
    confidence = calculate_confidence(["suspicious_link"], False, 60, 0)  # Only rule has evidence
    assert 0.5 <= confidence <= 0.8
    
    confidence = calculate_confidence([], True, 0, 10)  # Only AI has evidence
    assert 0.5 <= confidence <= 0.8
    
    # Test low confidence when no evidence
    confidence = calculate_confidence([], False, 0, 0)  # No evidence at all
    assert confidence < 0.5

def test_ai_available_logic():
    """Test the logic for determining ai_available from ai_result"""
    # Simulate successful AI response
    ai_result_success = {"ai_risk_delta": 10, "ai_explanation": "Some explanation", "ai_available": True}
    ai_available = bool(ai_result_success.get("ai_available", False))
    assert ai_available is True
    
    # Simulate failed AI response
    ai_result_failure = {"ai_risk_delta": 0, "ai_explanation": "AI unavailable", "ai_available": False}
    ai_available = bool(ai_result_failure.get("ai_available", False))
    assert ai_available is False
    
    # Simulate old response without ai_available field (should default to False)
    ai_result_old = {"ai_risk_delta": 0, "ai_explanation": "AI analysis unavailable."}
    ai_available = bool(ai_result_old.get("ai_available", False))
    assert ai_available is False

def test_blacklist_functionality():
    """Test the blacklist functionality directly"""
    # Test blacklisted domain
    assert check_blacklist("Visit scam-example.com to verify your account") is True
    
    # Test blacklisted pattern
    assert check_blacklist("Go to verify-your-account-now.com for urgent updates") is True
    
    # Test non-blacklisted content
    assert check_blacklist("Visit google.com for information") is False

def test_hard_veto_results_in_phishing_verdict():
    """Test that blacklisted content scores 100 with verdict PHISHING regardless of AI input"""
    # Test with a blacklisted domain - should result in hard veto
    score = calculate_final_score(base_score=10, ai_delta=-10, hard_veto=True)  # Even with negative AI delta
    assert score == 100
    
    # With score of 100, verdict should always be PHISHING regardless of other factors
    verdict, risk_level, action = get_verdict_and_level_and_action(score, [], True)  # Even with AI available
    assert verdict == "PHISHING"
    assert risk_level == "CRITICAL"
    assert action == "Do not respond. Report and delete immediately."

def test_database_basic_operations():
    """Test basic database operations without worrying about file cleanup in this environment."""
    # Use a unique temp file
    import uuid
    temp_db_path = f"test_temp_db_{uuid.uuid4().hex}.db"
    
    try:
        # Create DB instance
        db = ScanHistoryDB(db_path=temp_db_path)
        
        # Save a test scan
        db.save_scan(
            input_type="url",
            risk_score=25,
            verdict="SAFE",
            risk_level="LOW",
            signals=["test signal"],
            ai_explanation="Test explanation"
        )
        
        # Retrieve the scan
        scans = db.get_recent_scans(limit=1)
        assert len(scans) >= 1  # At least one scan should be returned
        
        # Find our specific test scan
        target_scan = None
        for scan in scans:
            if scan["input_type"] == "url" and scan["risk_score"] == 25:
                target_scan = scan
                break
        
        assert target_scan is not None
        # Verify the data
        assert target_scan["input_type"] == "url"
        assert target_scan["risk_score"] == 25
        assert target_scan["verdict"] == "SAFE"
        assert target_scan["risk_level"] == "LOW"
        assert target_scan["signals"] == ["test signal"]
        assert target_scan["ai_explanation"] == "Test explanation"
    finally:
        # Attempt to clean up, but don't fail the test if it fails due to file locks
        try:
            if os.path.exists(temp_db_path):
                os.remove(temp_db_path)
        except:
            pass  # Ignore cleanup errors