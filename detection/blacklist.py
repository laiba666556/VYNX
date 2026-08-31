"""
Blacklist module for detecting known malicious indicators.

This module contains a seed list of known malicious domains and patterns.
This is initial seed data that should be expanded over time with more comprehensive lists.
"""

import re
from typing import List


# Seed list of known malicious domains/patterns (to be expanded later)
BLACKLISTED_DOMAINS = {
    "scam-example.com",
    "fake-bank-phish.net",
    "malware-distribution.org",
    "phishing-kit.com",
    "fake-paypal-login.info"
}

# Seed list of known malicious patterns (to be expanded later)
BLACKLISTED_PATTERNS = [
    r"verify-your-account-\w+\.com",      # Pattern for account verification scams
    r"urgent-security-alert-\w+\.net",    # Pattern for security alert scams
    r"paypal-security-\w+\.org",          # Pattern for PayPal impersonation
    r"bank-security-\w+\.info",           # Pattern for bank impersonation
]


def check_blacklist(content: str) -> bool:
    """
    Check if the content contains any blacklisted indicators.
    
    Args:
        content: The content to check against the blacklist
        
    Returns:
        bool: True if any blacklisted indicator is found, False otherwise
    """
    content_lower = content.lower()
    
    # Check for blacklisted domains
    for domain in BLACKLISTED_DOMAINS:
        if domain.lower() in content_lower:
            return True
    
    # Check for blacklisted patterns
    for pattern in BLACKLISTED_PATTERNS:
        if re.search(pattern, content_lower, re.IGNORECASE):
            return True
    
    return False