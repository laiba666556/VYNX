import { useState, useEffect } from 'react';
import RiskMeter from './components/RiskMeter';
import Toast from './components/Toast';
import HistoryPanel from './components/HistoryPanel';
import type { ScanResponse } from './types';

function App() {
  const [inputType, setInputType] = useState<'url' | 'message' | 'email'>('url');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScan = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_type: inputType, content: content }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
      // Bump refresh key to trigger history reload
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Scan failed:', error);
      setToastMessage('Backend unreachable — start the server and try again');
    } finally {
      setLoading(false);
    }
  };

  // Clear toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const getVerdictColor = (level: string) => {
    switch(level) {
      case 'LOW': return 'verdict-low';
      case 'MEDIUM': return 'verdict-medium';
      case 'HIGH': return 'verdict-high';
      case 'CRITICAL': return 'verdict-critical';
      default: return 'verdict-default';
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="wordmark">VYNX</h1>
        <p className="tagline">AI-Powered Phishing & Scam Detection for Pakistan</p>
      </header>

      <div className="main-content">
        <div className="scanner-section">
          <div className="input-controls">
            <div className="tab-buttons">
              {(['url', 'message', 'email'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setInputType(type)}
                  className={`tab-button ${inputType === type ? 'active-tab' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={inputType === 'url' ? 'Paste URL here...' : 'Paste message or email content here...'}
              className="input-textarea"
            />

            <button
              onClick={handleScan}
              disabled={loading || !content.trim()}
              className="scan-button"
            >
              {loading ? 'Analyzing...' : 'Scan for Threats'}
            </button>
          </div>

          {result && (
            <div className="result-panel">
              <div className="meter-and-info">
                <RiskMeter score={result.risk_score} level={result.risk_level} />
                
                <div className="info-sections">
                  <div className="verdict-section">
                    <span className={`verdict-chip ${getVerdictColor(result.risk_level)}`}>
                      {result.verdict}
                    </span>
                    <span className={`risk-level-chip ${getVerdictColor(result.risk_level)}`}>
                      {result.risk_level}
                    </span>
                  </div>

                  <div className="confidence-section">
                    <p>Confidence: {Math.round(result.confidence * 100)}%</p>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="action-section">
                    <p className="recommended-action">{result.recommended_action}</p>
                  </div>
                </div>
              </div>

              {result.signals.length > 0 && (
                <div className="signals-section">
                  <p>Triggered Signals:</p>
                  <ul className="signals-list">
                    {result.signals.map((signal, idx) => (
                      <li key={idx} className="signal-item">{signal}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ai-section">
                {result.ai_available && result.ai_explanation ? (
                  <div>
                    <p className="ai-title">🤖 AI Analysis:</p>
                    <p>{result.ai_explanation}</p>
                  </div>
                ) : (
                  <p className="ai-offline">AI engine offline — rule-engine verdict only</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="history-section">
          <HistoryPanel refreshKey={refreshKey} />
        </div>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}

export default App;