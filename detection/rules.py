import re
import urllib.parse

# Pakistan-specific services with their official domains
PAKISTANI_SERVICES = {
    "hbl": "hbl.com.pk",
    "ubl": "ubl.com.pk",
    "meezan": "meezanbank.com.pk",
    "jazzcash": "jazzcash.com.pk",
    "easypaisa": "easypaisa.com.pk",
    "nadra": "nadra.gov.pk",
    "fbr": "fbr.gov.pk",
    "ptcl": "ptcl.com.pk",
    "ufone": "ufone.com",
    "zong": "zong.com.pk",
    "bankalfalah": "bankalfalah.com",
    "askari": "askaribank.com",
    "faysal": "faysalbank.com",
    "nbp": "nbp.com.pk",
}

def _build_substitution_regex(service_name: str) -> str:
    pattern = ""
    for char in service_name.lower():
        if char == 'o':
            pattern += '[o0]'
        elif char in ('l', 'i'):
            pattern += '[li1]'
        elif char == 'e':
            pattern += '[e3]'
        elif char == 's':
            pattern += '[s5]'
        elif char == 'a':
            pattern += '[a4]'
        else:
            pattern += re.escape(char)
    return pattern

def analyze_url(url: str) -> tuple[list[str], int]:
    signals = []
    score = 0
    url_lower = url.lower()

    parsed = urllib.parse.urlparse(url)
    hostname = parsed.netloc.lower() if parsed.netloc else url_lower
    for service, official_domain in PAKISTANI_SERVICES.items():
        sub_pattern = _build_substitution_regex(service)
        if re.search(sub_pattern, hostname) and not hostname.endswith(official_domain):
            signals.append(f"Look-alike domain mimicking {service.upper()}")
            score += 25
            break

    if len(url) > 75:
        signals.append("Unusually long URL")
        score += 10

    ip_pattern = r'https?://(?:\d{1,3}\.){3}\d{1,3}'
    if re.search(ip_pattern, url):
        signals.append("IP address used as hostname")
        score += 20

    if "xn--" in url_lower:
        signals.append("Punycode encoding detected (homograph attack risk)")
        score += 15

    suspicious_keywords = ["login", "verify", "account", "secure", "update", "password", "confirm", "log in", "verify karen", "acc", "acount", "pasword", "fori", "jawab den"]
    urdu_suspicious = ["لاگ ان", "تصدیق", "اکاؤنٹ", "سیکور", "اپ ڈیٹ", "پاس ورڈ", "تصدیق کریں", "فوری"]
    found_keywords = [kw for kw in suspicious_keywords if kw in url_lower]
    found_urdu_keywords = [kw for kw in urdu_suspicious if kw in url]
    total_suspicious_found = len(found_keywords) + len(found_urdu_keywords)
    if total_suspicious_found > 0:
        if found_keywords:
            signals.append(f"Suspicious keywords in URL: {', '.join(found_keywords)}")
        if found_urdu_keywords:
            signals.append(f"Suspicious Urdu keywords in URL: {', '.join(found_urdu_keywords)}")
        score += 10 * min(total_suspicious_found, 3)

    shorteners = ["bit.ly", "tinyurl", "goo.gl", "t.co", "short.link"]
    if any(shortener in url_lower for shortener in shorteners):
        signals.append("URL shortener detected")
        score += 15

    return signals, min(score, 100)

def analyze_message(text: str) -> tuple[list[str], int]:
    signals = []
    score = 0
    text_lower = text.lower()

    from_match = re.search(r'From:\s*(.*)', text, re.IGNORECASE)
    sender_name = None
    sender_domain = None
    if from_match:
        sender_info = from_match.group(1).strip()
        if '<' in sender_info and '>' in sender_info:
            sender_name = sender_info.split('<')[0].strip()
            email_part = sender_info.split('<')[1].split('>')[0].strip()
            if '@' in email_part:
                sender_domain = email_part.split('@')[-1].lower()
        elif '@' in sender_info:
            sender_domain = sender_info.split('@')[-1].lower()

    urgency_words = ["urgent", "immediate", "now", "asap", "today", "within 24 hours", "hurry", "act now", "limited time"]
    roman_urgency = ["urgent hai", "jaldi", "abhi", "fori", "turant", "jalda"]
    urdu_urgency = ["فوری", "اہم", "ابھی", "جلد از جلد"]
    found_urgency = [w for w in urgency_words if w in text_lower]
    found_roman_urgency = [w for w in roman_urgency if w in text_lower]
    found_urdu_urgency = [w for w in urdu_urgency if w in text]
    total_urgency = len(found_urgency) + len(found_roman_urgency) + len(found_urdu_urgency)
    if total_urgency > 0:
        if found_urgency:
            signals.append(f"English urgency tactics detected: {', '.join(found_urgency)}")
        if found_roman_urgency:
            signals.append(f"Roman-Urdu urgency tactics detected: {', '.join(found_roman_urgency)}")
        if found_urdu_urgency:
            signals.append(f"Urdu-script urgency tactics detected: {', '.join(found_urdu_urgency)}")
        score += 10 * min(total_urgency, 3)

    threat_words = ["suspended", "blocked", "terminated", "legal action", "arrest", "frozen", "penalty", "fine"]
    roman_threats = ["band", "block ho jayega", "terminate", "qanon", "jarima", "account band"]
    urdu_threats = ["بند", "بلاک", "ختم", "قانونی کارروائی", "گرفتاری", "جم", "جرمانہ", "اکاؤنٹ بند ہو جائے گا"]
    found_threats = [w for w in threat_words if w in text_lower]
    found_roman_threats = [w for w in roman_threats if w in text_lower]
    found_urdu_threats = [w for w in urdu_threats if w in text]
    total_threats = len(found_threats) + len(found_roman_threats) + len(found_urdu_threats)
    if total_threats > 0:
        if found_threats:
            signals.append(f"English threat-based language detected: {', '.join(found_threats)}")
        if found_roman_threats:
            signals.append(f"Roman-Urdu threat-based language detected: {', '.join(found_roman_threats)}")
        if found_urdu_threats:
            signals.append(f"Urdu-script threat-based language detected: {', '.join(found_urdu_threats)}")
        score += 15 * min(total_threats, 2)

    credential_words = ["otp", "password", "verification code", "login credentials", "pin", "cvv", "card details"]
    roman_credentials = ["code batao", "code bhejen", "password batao", "card number"]
    urdu_credentials = ["کوڈ بتاؤ", "کوڈ بھیجیں", "پاس ورڈ", "پن", "کارڈ نمبر", "پاس ورڈ بتاؤ"]
    found_credentials = [w for w in credential_words if w in text_lower]
    found_roman_credentials = [w for w in roman_credentials if w in text_lower]
    found_urdu_credentials = [w for w in urdu_credentials if w in text]
    total_credentials = len(found_credentials) + len(found_roman_credentials) + len(found_urdu_credentials)
    if total_credentials > 0:
        if found_credentials:
            signals.append(f"English sensitive information requested: {', '.join(found_credentials)}")
        if found_roman_credentials:
            signals.append(f"Roman-Urdu sensitive information requested: {', '.join(found_roman_credentials)}")
        if found_urdu_credentials:
            signals.append(f"Urdu-script sensitive information requested: {', '.join(found_urdu_credentials)}")
        score += 20 * min(total_credentials, 1)

    financial_words = ["payment", "transfer", "account number", "bank", "rupees", "pkr", "jazzcash", "easypaisa", "hbl"]
    roman_financial = ["paisay", "rupay", "paisa transfer", "bank account", "jazz cash", "easy paisa"]
    urdu_financial = ["پیسے", "روپے", "پیسا ٹرانسفير", "بینک اکاؤنٹ", "جاز کیش", "ایزی پیسہ"]
    found_financial = [w for w in financial_words if w in text_lower]
    found_roman_financial = [w for w in roman_financial if w in text_lower]
    found_urdu_financial = [w for w in urdu_financial if w in text]
    total_financial = len(found_financial) + len(found_roman_financial) + len(found_urdu_financial)
    if total_financial > 0:
        if found_financial:
            signals.append(f"English financial context detected: {', '.join(found_financial)}")
        if found_roman_financial:
            signals.append(f"Roman-Urdu financial context detected: {', '.join(found_roman_financial)}")
        if found_urdu_financial:
            signals.append(f"Urdu-script financial context detected: {', '.join(found_urdu_financial)}")
        score += 15 * min(total_financial, 2)

    if sender_name and sender_domain:
        institutional_names = ["hbl", "ubl", "meezan", "jazzcash", "easypaisa", "nbp", "askari", "faysal", "bank", "government", "ministry", "court"]
        free_email_domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com", "icloud.com"]
        if any(name in sender_name.lower() for name in institutional_names) and sender_domain in free_email_domains:
            signals.append(f"Sender spoofing detected: {sender_name} using free email domain {sender_domain}")
            score += 30

    return signals, min(score, 100)