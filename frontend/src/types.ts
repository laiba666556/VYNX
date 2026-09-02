export type ViewState = 'sign-in' | 'dashboard' | 'scanner' | 'history';
 
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
 
export interface StatsResponse {
  total_scans: number;
  verdict_counts: Record<string, number>;
  risk_level_counts: Record<string, number>;
  threats_blocked: number;
  safe_pct: number;
  last_scan_at: string | null;
}