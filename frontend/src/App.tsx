import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Globe,
  MessageSquare,
  Mail,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  Cpu,
} from 'lucide-react';
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

  const TAB_ICONS = {
    url: Globe,
    message: MessageSquare,
    email: Mail,
  };

  const SAMPLE_INPUTS: Array<{ label: string; type: InputType; text: string }> = [
    {
      label: 'HBL Account Alert',
      type: 'message',
      text: 'Muaziz Sarif, apka HBL account biometric na hone ki wajah se block kr dya gya hy. Fori bahaali k lye rabta krain: http://hbl-verify-security.com',
    },
    {
      label: 'JazzCash Reward',
      type: 'message',
      text: 'Mubarak ho! Apko Benazir Income Support Program ki taraf se 25,000 rupay milay hain. Is link pr apna CNIC darj kren: bit.ly/bisp-cash-2026',
    },
    {
      label: 'Suspicious Bank URL',
      type: 'url',
      text: 'http://secure-login.meezanbank-verify.pk/account/auth',
    },
  ];

  const scannerView = (
    <section className="scanner-section" aria-labelledby="scanner-heading" aria-busy={loading}>
      <div className="scanner-hero">
        <div className="scanner-pill-badge">
          <Sparkles size={14} className="spark-icon" />
          <span>Real-Time Detection Engine</span>
        </div>
        <h1 className="view-heading" id="scanner-heading">Threat Scanner</h1>
        <p className="view-sub">Analyze suspicious links, SMS, WhatsApp alerts, or emails across English, Roman-Urdu, and Urdu.</p>
      </div>

      <div className="input-controls">
        <div className="tab-buttons" role="group" aria-label="What are you scanning?">
          {(['url', 'message', 'email'] as const).map((type) => {
            const Icon = TAB_ICONS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setInputType(type)}
                aria-pressed={inputType === type}
                className={`tab-button ${inputType === type ? 'active-tab' : ''}`}
              >
                <Icon size={15} />
                <span style={{ textTransform: 'capitalize' }}>{type}</span>
              </button>
            );
          })}
        </div>

        <div className="textarea-container">
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
        </div>

        {/* Quick prompt suggestions inspired by reference design */}
        <div className="sample-prompts-wrap">
          <span className="sample-prompts-label">Try sample:</span>
          <div className="sample-prompts-list">
            {SAMPLE_INPUTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                className="sample-prompt-chip"
                onClick={() => {
                  setInputType(sample.type);
                  setContent(sample.text);
                }}
              >
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="scan-actions-bar">
          <button
            type="button"
            onClick={handleScan}
            disabled={loading || !content.trim()}
            className="scan-button"
          >
            {loading ? (
              <span className="scan-button-content">
                <span className="spinner-dots" />
                <span>Analyzing threat…</span>
              </span>
            ) : (
              <span className="scan-button-content">
                <Sparkles size={18} />
                <span>Scan for threats</span>
                <span className="kbd-shortcut" title="Press Ctrl + Enter to scan">Ctrl + ↵</span>
              </span>
            )}
          </button>
        </div>

        <p className="scan-hint" id="scan-hint">
          Paste in English, Roman-Urdu, or Urdu — the script is detected automatically. Press Ctrl + Enter to scan;
          results stay on this device under your guest session.
        </p>
      </div>

      {loading && (
        <div className="result-panel scanning-active-card" aria-busy="true">
          <div className="scan-beam" aria-hidden="true" />
          <div className="scanning-status-row">
            <div className="pulse-radar" aria-hidden="true">
              <div className="pulse-radar-dot" />
            </div>
            <div>
              <div className="scanning-status-title">Deep Threat Inspection in Progress…</div>
              <div className="scanning-status-sub">Evaluating heuristics, linguistic signatures, and phishing vector matrices</div>
            </div>
          </div>
          <div className="meter-and-info">
            <div className="skeleton skeleton-lg" style={{ width: 148, height: 148, borderRadius: '50%' }} />
            <div className="info-sections">
              <div className="skeleton" style={{ width: '45%', height: 32, borderRadius: 999 }} />
              <div className="skeleton" style={{ width: '80%', height: 16 }} />
              <div className="skeleton" style={{ width: '100%', height: 52, borderRadius: 20 }} />
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
                <span className={`verdict-chip ${levelClass(result.risk_level)}`}>
                  {result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH' ? (
                    <ShieldAlert size={14} className="chip-icon" />
                  ) : (
                    <ShieldCheck size={14} className="chip-icon" />
                  )}
                  <span>{result.verdict}</span>
                </span>
                <span className={`risk-level-chip ${levelClass(result.risk_level)}`}>
                  {result.risk_level} RISK
                </span>
              </div>

              <div className="confidence-section">
                <div className="confidence-label-row">
                  <span>Detection Confidence</span>
                  <strong>{Math.round(result.confidence * 100)}%</strong>
                </div>
                <div className="confidence-bar">
                  <div
                    className={`confidence-fill ${levelClass(result.risk_level)}`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              <div className={`action-section action-card--${result.risk_level.toLowerCase()}`}>
                <div className="action-icon-wrap">
                  {result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH' ? (
                    <AlertTriangle size={18} />
                  ) : result.risk_level === 'MEDIUM' ? (
                    <Info size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                </div>
                <div className="action-text-wrap">
                  <span className="action-title">Advisory Action</span>
                  <p className="recommended-action">{result.recommended_action}</p>
                </div>
              </div>
            </div>
          </div>

          {result.signals.length > 0 && (
            <div className="signals-section">
              <p className="signals-title">
                <span>Triggered Threat Signals:</span>
                <span className="signals-count-pill">{result.signals.length} flags</span>
              </p>
              <ul className="signals-list">
                {result.signals.map((signal, index) => (
                  <li key={`${signal}-${index}`} className="signal-item">
                    <span className="signal-bullet" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="ai-section">
            {result.ai_available && result.ai_explanation ? (
              <div className="ai-explanation-card">
                <div className="ai-title-wrap">
                  <div className="ai-badge">
                    <Cpu size={14} />
                    <span>Neural AI Explanation</span>
                  </div>
                </div>
                <p className="ai-explanation-text">{result.ai_explanation}</p>
              </div>
            ) : (
              <div className="ai-offline-wrap">
                <Info size={14} />
                <p className="ai-offline">AI engine offline — rule-engine verdict only</p>
              </div>
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
          {/* Ambient background glows */}
          <div className="ambient-orb orb-1" aria-hidden="true" />
          <div className="ambient-orb orb-2" aria-hidden="true" />
          <div className="ambient-orb orb-3" aria-hidden="true" />

          <Sidebar
            view={view}
            onNavigate={setView}
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onSignOut={handleSignOut}
            onOpenLegal={() => setLegalOpen(true)}
          />

          <main className="view-container">
            {/* Top ambient cybersecurity status pill */}
            <div className="system-status-pill" role="status">
              <div className="system-status-left">
                <span className="live-dot" aria-hidden="true" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Neural Threat Engine Active</span>
                <span>•</span>
                <span>Qwen AI + Rule Heuristics</span>
              </div>
              <div className="system-status-right">
                <span>Urdu / Roman-Urdu / English</span>
                <span>•</span>
                <span>Zero-Trace Private Session</span>
              </div>
            </div>

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
