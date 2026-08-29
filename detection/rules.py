import re

def analyze_url(url: str) -> tuple[list[str], int]:
    """
    Analyzes a URL for suspicious patterns.
    Returns a tuple of (list of triggered signals, partial score).
    """
    signals = []
    score = 0
    url_lower = url.lower()

    # 1. Length check (> 75 characters)
    if len(url) > 75:
        signals.append("Unusually long URL")
        score += 10

    # 2. IP address as hostname (e.g., http://192.168.1.1 or http://123.45.67.89)
    ip_pattern = r'https?://(?:\d{1,3}\.){3}\d{1,3}'
    if re.search(ip_pattern, url):
        signals.append("IP address used as hostname")
        score += 20

    # 3. Punycode (xn--)
    if "xn--" in url_lower:
        signals.append("Punycode encoding detected (homograph attack risk)")
        score += 15

    # 4. Suspicious keywords
    suspicious_keywords = ["login", "verify", "account", "secure", "update", "password", "confirm"]
    found_keywords = [kw for kw in suspicious_keywords if kw in url_lower]
    if found_keywords:
        signals.append(f"Suspicious keywords in URL: {', '.join(found_keywords)}")
        score += 10 * len(found_keywords)

    # 5. URL shorteners
    shorteners = ["bit.ly", "tinyurl", "goo.gl", "t.co", "short.link"]
    if any(shortener in url_lower for shortener in shorteners):
        signals.append("URL shortener detected")
        score += 15

    return signals, score


def analyze_message(text: str) -> tuple[list[str], int]:
    """
    Analyzes a message/email for social engineering and scam patterns.
    Returns a tuple of (list of triggered signals, partial score).
    """
    signals = []
    score = 0
    text_lower = text.lower()

    # 1. Urgency words
    urgency_words = ["urgent", "immediate", "now", "asap", "today", "within 24 hours"]
    found_urgency = [word for word in urgency_words if word in text_lower]
    if found_urgency:
        signals.append(f"Urgency tactics detected: {', '.join(found_urgency)}")
        score += 10 * len(found_urgency)

    # 2. Fear words
    fear_words = ["suspended", "blocked", "terminated", "legal action", "arrest", "frozen"]
    found_fear = [word for word in fear_words if word in text_lower]
    if found_fear:
        signals.append(f"Fear-based language detected: {', '.join(found_fear)}")
        score += 15 * len(found_fear)

    # 3. OTP/Credential requests
    credential_words = ["otp", "password", "verification code", "login credentials", "pin", "cvv"]
    found_credentials = [word for word in credential_words if word in text_lower]
    if found_credentials:
        signals.append(f"Sensitive information requested: {', '.join(found_credentials)}")
        score += 20 * len(found_credentials)

    # 4. Financial requests
    financial_words = ["payment", "transfer", "account number", "bank", "rupees", "pkr", "jazzcash", "easypaisa", "hbl"]
    found_financial = [word for word in financial_words if word in text_lower]
    if found_financial:
        signals.append(f"Financial context detected: {', '.join(found_financial)}")
        score += 15 * len(found_financial)

    return signals, score