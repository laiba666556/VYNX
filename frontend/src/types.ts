export interface ScanResponse {
  risk_score: number;
  verdict: string;
  risk_level: string;
  signals: string[];
  ai_available: boolean;
  ai_explanation: string | null;
  confidence: number;
  recommended_action: string;
}

export interface HistoryEntry {
  input_type: string;
  risk_score: number;
  verdict: string;
  risk_level: string;
  signals: string[];
  ai_explanation: string | null;
  created_at: string;
}