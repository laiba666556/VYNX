import React, { useEffect, useState } from 'react';
import type { HistoryEntry } from '../types';

interface HistoryPanelProps {
  refreshKey: number;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ refreshKey }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/history');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError('Failed to load history');
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [refreshKey]);

  const getVerdictColor = (level: string) => {
    switch(level) {
      case 'LOW': return 'verdict-low';
      case 'MEDIUM': return 'verdict-medium';
      case 'HIGH': return 'verdict-high';
      case 'CRITICAL': return 'verdict-critical';
      default: return 'verdict-default';
    }
  };

  if (loading) return <div className="history-loading">Loading...</div>;
  if (error) return <div className="history-error">{error}</div>;

  return (
    <div className="history-panel">
      <h2>Scan History</h2>
      {history.length === 0 ? (
        <div className="history-empty">No scans yet</div>
      ) : (
        <ul className="history-list">
          {history.map((entry, index) => (
            <li key={index} className="history-item">
              <div className="history-item-header">
                <span className={`verdict-chip ${getVerdictColor(entry.risk_level)}`}>
                  {entry.verdict}
                </span>
                <span className="history-input-type">{entry.input_type}</span>
                <span className="history-score">Score: {entry.risk_score}</span>
              </div>
              <div className="history-timestamp">{new Date(entry.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPanel;