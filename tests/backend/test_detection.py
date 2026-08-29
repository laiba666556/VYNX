import sys
import os
import pytest

# Add the root VYNX directory to the path so Python can find the 'detection' folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from detection.rules import analyze_url, analyze_message
from detection.scoring import calculate_final_score, get_verdict_and_level

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
    assert get_verdict_and_level(10) == ("SAFE", "LOW")
    assert get_verdict_and_level(30) == ("SPAM", "MEDIUM")
    assert get_verdict_and_level(60) == ("SUSPICIOUS", "HIGH")
    assert get_verdict_and_level(90) == ("PHISHING", "CRITICAL")