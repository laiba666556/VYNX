from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal

class ScanRequest(BaseModel):
    input_type: Literal["url", "message", "email"]
    content: str

    @field_validator('content')
    def validate_length(cls, v, info):
        input_type = info.data.get('input_type')
        if input_type == 'url' and len(v) > 2000:
            raise ValueError('URL must be 2000 characters or less')
        if input_type == 'message' and len(v) > 2000:
            raise ValueError('Message must be 2000 characters or less')
        if input_type == 'email' and len(v) > 10000:
            raise ValueError('Email must be 10000 characters or less')
        return v.strip()

class ScanResponse(BaseModel):
    risk_score: int
    verdict: str
    risk_level: str
    signals: list[str]
    ai_available: bool
    ai_explanation: Optional[str] = None
    confidence: float
    recommended_action: str