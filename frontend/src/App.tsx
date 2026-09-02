import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import RiskMeter from './components/RiskMeter';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import HistoryPanel from './components/HistoryPanel';
import LegalModal from './components/LegalModal';
import ErrorBoundary from './components/ErrorBoundary';
import type { ScanResponse, ViewState } from './types';

type Theme = 'light' | 'dark';
type InputType = 'url' | 'message' | 'email';

const SESSION_KEY = 'vynx-session';
const THEME_KEY = 'vynx-theme';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const ERROR_MESSAGES: Record<number, string> = {
  413: 'Content too large — trim it and try again',
  422: 'Check your input — it did not pass validation',
  429: 'Too many scans — wait a minute and try again',
  500: 'Server error while scanning — please try again',
  502: 'Backend unreachable — start the server and try again',
  503: 'Backend unreachable — start the server and try again',
  504: 'Backend unreachable — start the server and try again',
};

const PLACEHOLDERS: Record<InputType, string> = {
  url: 'Paste the suspicious link here…',
  message: 'Paste the SMS or WhatsApp message here…',
  email: 'Paste the full email, including the sender line…',
};

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function readStoredSession(): string | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored && UUID_PATTERN.test(stored)) return stored;
  } catch {
    // Storage blocked (private mode) — fall back to an in-memory session
  }
  return null;
}

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function levelClass(level: string): string {
  switch (level) {
    case 'LOW':
      return 'verdict-low';
    case 'MEDIUM':
      return 'verdict-medium';
    case 'HIGH':
      return 'verdict-high';
    case 'CRITICAL':
      return 'verdict-critical';
    default:
      return 'verdict-default';
  }
}

function App() {
  const [sessionId, setSessionId] = useState<string | null>(() => readStoredSession());
  const [view, setView] = useState<ViewState>(() => (readStoredSession() ? 'scanner' : 'sign-in'));
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());
  const [legalOpen, setLegalOpen] = useState(false);
  const [inputType, setInputType] = useState<InputType>('url');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage blocked — theme still applies for this visit
    }
  }, [theme]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleSignIn = () => {
    const id = createSessionId();
    try {
      localStorage.setItem(SESSION_KEY, id);
    } catch {
      // Storage blocked — keep the session in memory for this visit
    }
    setSessionId(id);
    setView('scanner');
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Nothing stored, nothing to remove
    }
    setSessionId(null);
    setResult(null);
    setContent('');
    setView('sign-in');
  };

  const handleScan = async () => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setResult(null);
    const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';

    try {
      const response = await fetch(`/api/scan${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_type: inputType, content: trimmed }),
      });

      if (!response.ok) {
        setToastMessage(ERROR_MESSAGES[response.status] ?? `Scan failed (HTTP ${response.status})`);
        return;
      }

      const data: ScanResponse = await response.json();
      setResult(data);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Scan failed:', error);
      setToastMessage('Backend unreachable — start the server and try again');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleScan();
    }
  };

  const scannerView = (
    <section className="scanner-section" aria-labelledby="scanner-heading" aria-busy={loading}>
      <h1 className="view-heading" id="scanner-heading">Scan something suspicious</h1>
      <p className="view-sub">Paste a link, SMS, or email. English, Roman-Urdu, and Urdu all work.</p>

      <div className="input-controls">
        <div className="tab-buttons" role="group" aria-label="What are you scanning?">
          {(['url', 'message', 'email'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setInputType(type)}
              aria-pressed={inputType === type}
              className={`tab-button ${inputType === type ? 'active-tab' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="scan-input">
          Content to scan
        </label>
        <textarea
          id="scan-input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS[inputType]}
          className="input-textarea"
          aria-describedby="scan-hint"
          spellCheck={false}
        />

        <button type="button" onClick={handleScan} disabled={loading || !content.trim()} className="scan-button">
          {loading ? 'Analyzing…' : 'Scan for threats'}
        </button>
        <p className="scan-hint" id="scan-hint">
          Paste in English, Roman-Urdu, or Urdu — the script is detected automatically. Press Ctrl + Enter to scan;
          results stay on this device under your guest session.
        </p>
      </div>

      {loading && (
        <div className="result-panel" aria-busy="true">
          <div className="meter-and-info">
            <div className="skeleton skeleton-lg" style={{ width: 140, height: 140, borderRadius: '50%' }} />
            <div className="info-sections">
              <div className="skeleton" style={{ width: '60%' }} />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          </div>
        </div>
      )}

      {!loading && result && (
        <div className="result-panel" aria-live="polite">
          <div className="meter-and-info">
            <RiskMeter score={result.risk_score} level={result.risk_level} />

            <div className="info-sections">
              <div className="verdict-section">
                <span className={`verdict-chip ${levelClass(result.risk_level)}`}>{result.verdict}</span>
                <span className={`risk-level-chip ${levelClass(result.risk_level)}`}>{result.risk_level}</span>
              </div>

              <div className="confidence-section">
                <p>Confidence: {Math.round(result.confidence * 100)}%</p>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${result.confidence * 100}%` }} />
                </div>
              </div>

              <div className="action-section">
                <p className="recommended-action">{result.recommended_action}</p>
              </div>
            </div>
          </div>

          {result.signals.length > 0 && (
            <div className="signals-section">
              <p>Triggered signals:</p>
              <ul className="signals-list">
                {result.signals.map((signal, index) => (
                  <li key={`${signal}-${index}`} className="signal-item">
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="ai-section">
            {result.ai_available && result.ai_explanation ? (
              <div>
                <p className="ai-title">AI analysis</p>
                <p>{result.ai_explanation}</p>
              </div>
            ) : (
              <p className="ai-offline">AI engine offline — rule-engine verdict only</p>
            )}
          </div>
        </div>
      )}
    </section>
  );

  return (
    <ErrorBoundary>
      {!sessionId || view === 'sign-in' ? (
        <SignIn onSignIn={handleSignIn} onOpenLegal={() => setLegalOpen(true)} />
      ) : (
        <div className="app-shell">
          <Sidebar
            view={view}
            onNavigate={setView}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onSignOut={handleSignOut}
            onOpenLegal={() => setLegalOpen(true)}
          />

          <main className="view-container">
            {view === 'scanner' && scannerView}
            {view === 'dashboard' && <Dashboard sessionId={sessionId} refreshKey={refreshKey} />}
            {view === 'history' && <HistoryPanel sessionId={sessionId} refreshKey={refreshKey} />}
          </main>
        </div>
      )}

      {legalOpen && <LegalModal onClose={() => setLegalOpen(false)} />}
      <Toast message={toastMessage} />
    </ErrorBoundary>
  );
}

export default App;
