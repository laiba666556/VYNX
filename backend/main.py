from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models import ScanRequest, ScanResponse
from detection.rules import analyze_url, analyze_message
from detection.scoring import calculate_final_score, get_verdict_and_level
from ai.qwen_client import analyze_with_qwen

app = FastAPI(title="VYNX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/scan", response_model=ScanResponse)
async def scan_content(request: ScanRequest):
    signals = []
    base_score = 0

    # 1. Run Rule Engine (Synchronous and very fast)
    if request.input_type == "url":
        signals, base_score = analyze_url(request.content)
    elif request.input_type in ["message", "email"]:
        signals, base_score = analyze_message(request.content)

    # 2. Run AI Engine (Asynchronous)
    ai_result = await analyze_with_qwen(request.content, request.input_type)
    
    ai_delta = ai_result.get("ai_risk_delta", 0)
    ai_explanation = ai_result.get("ai_explanation", "AI analysis unavailable.")
    
    # If we have a placeholder key, AI might return 0 delta, which is fine (fallback mode)
    ai_available = ai_delta != 0 or ai_explanation != "AI analysis unavailable."

    # 3. Evidence Fusion
    final_score = calculate_final_score(base_score=base_score, ai_delta=ai_delta, hard_veto=False)
    verdict, risk_level = get_verdict_and_level(final_score)

    return ScanResponse(
        risk_score=final_score,
        verdict=verdict,
        risk_level=risk_level,
        signals=signals,
        ai_available=ai_available,
        ai_explanation=ai_explanation if ai_available else None
    )