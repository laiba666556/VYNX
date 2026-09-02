import os
import logging
from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.models import ScanRequest, ScanResponse, StatsResponse
from detection.rules import analyze_url, analyze_message
from detection.blacklist import check_blacklist
from detection.scoring import calculate_final_score, get_verdict_and_level_and_action, calculate_confidence
from ai.qwen_client import analyze_with_qwen
from backend.database import db
from backend.security import SecurityMiddleware

# Configure logging
logger = logging.getLogger(__name__)

UUID_PATTERN = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="VYNX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.add_middleware(
    SecurityMiddleware
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/scan", response_model=ScanResponse)
async def scan_content(request: ScanRequest, session_id: Optional[str] = Query(None, pattern=UUID_PATTERN)):
    signals = []
    base_score = 0
    hard_veto = False

    # Check for hard veto indicators first
    if check_blacklist(request.content):
        hard_veto = True
        signals.append("Known malicious indicator matched")

    # 1. Run Rule Engine (Synchronous and very fast) - only if no hard veto
    if not hard_veto:
        if request.input_type == "url":
            signals, base_score = analyze_url(request.content)
        elif request.input_type in ["message", "email"]:
            signals, base_score = analyze_message(request.content)

    # 2. Run AI Engine (Asynchronous) - only if no hard veto
    ai_result = {"ai_risk_delta": 0, "ai_explanation": "AI analysis unavailable.", "ai_available": False}
    if not hard_veto:
        ai_result = await analyze_with_qwen(request.content, request.input_type)
    
    ai_delta = ai_result.get("ai_risk_delta", 0)
    ai_explanation = ai_result.get("ai_explanation", "AI analysis unavailable.")
    
    # Updated line: Use the explicit ai_available from ai_result
    ai_available = bool(ai_result.get("ai_available", False))

    # 3. Evidence Fusion
    final_score = calculate_final_score(base_score=base_score, ai_delta=ai_delta, hard_veto=hard_veto)
    verdict, risk_level, recommended_action = get_verdict_and_level_and_action(final_score, signals, ai_available)
    confidence = calculate_confidence(signals, ai_available, base_score, ai_delta)

    response = ScanResponse(
        risk_score=final_score,
        verdict=verdict,
        risk_level=risk_level,
        signals=signals,
        ai_available=ai_available,
        ai_explanation=ai_explanation if ai_available else None,
        confidence=confidence,
        recommended_action=recommended_action
    )
    
    # Save scan to history (wrapped in try/except so it never breaks the response)
    try:
        db.save_scan(
            input_type=request.input_type,
            risk_score=final_score,
            verdict=verdict,
            risk_level=risk_level,
            signals=signals,
            ai_explanation=response.ai_explanation,
            session_id=session_id
        )
    except Exception as e:
        # Log error but continue with response
        logger.error(f"Error saving scan to history: {e}")
    
    return response

@app.get("/api/history")
def get_history(session_id: Optional[str] = Query(None, pattern=UUID_PATTERN)):
    """Return the last 20 scans, newest first, scoped to a session when given."""
    return db.get_recent_scans(limit=20, session_id=session_id)


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(session_id: Optional[str] = Query(None, pattern=UUID_PATTERN)):
    """Return aggregate scan counts for the dashboard."""
    return db.get_stats(session_id=session_id)