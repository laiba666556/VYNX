import { useEffect, useState } from 'react';
import type { HistoryEntry } from '../types';

interface HistoryPanelProps {
  sessionId: string;
  refreshKey: number;
}

const LEVEL_CLASS: Record<string, string> = {
  LOW: 'verdict-low',
  MEDIUM: 'verdict-medium',
  HIGH: 'verdict-high',
  CRITICAL: 'verdict-critical',
};

function formatTimestamp(value: string): string {
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function HistoryPanel({ sessionId, refreshKey }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/history?session_id=${encodeURIComponent(sessionId)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: HistoryEntry[] = await response.json();
        if (!cancelled) setHistory(data);
      } catch (err) {
        console.error('Error fetching history:', err);
        if (!cancelled) setError('Failed to load history — is the backend running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [sessionId, refreshKey]);

  return (
    <section className="history-panel" aria-labelledby="history-heading">
      <h2 id="history-heading">Scan history</h2>

      {loading && (
        <div className="history-loading" aria-busy="true">
          <div className="skeleton" />
          <div className="skeleton" style={{ marginTop: 10 }} />
          <div className="skeleton" style={{ marginTop: 10 }} />
        </div>
      )}

      {!loading && error && <div className="history-error">{error}</div>}

      {!loading && !error && history.length === 0 && (
        <div className="history-empty">No scans in this session yet.</div>
      )}

      {!loading && !error && history.length > 0 && (
        <ul className="history-list">
          {history.map((entry, index) => (
            <li key={`${entry.created_at}-${index}`} className="history-item">
              <div className="history-item-header">
                <span className={`verdict-chip ${LEVEL_CLASS[entry.risk_level] ?? 'verdict-default'}`}>
                  {entry.verdict}
                </span>
                <span className="history-input-type">{entry.input_type}</span>
                <span className="history-score">Score: {entry.risk_score}</span>
              </div>
              <div className="history-timestamp">{formatTimestamp(entry.created_at)}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default HistoryPanel;
