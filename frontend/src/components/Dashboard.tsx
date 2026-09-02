import { useEffect, useState } from 'react';
import type { StatsResponse } from '../types';

interface DashboardProps {
  sessionId: string;
  refreshKey: number;
}

const VERDICTS = ['SAFE', 'SPAM', 'SUSPICIOUS', 'PHISHING', 'UNKNOWN'];
const LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const VERDICT_BAR: Record<string, string> = {
  SAFE: 'bar-safe',
  SPAM: 'bar-spam',
  SUSPICIOUS: 'bar-suspicious',
  PHISHING: 'bar-phishing',
  UNKNOWN: 'bar-unknown',
};

const LEVEL_BAR: Record<string, string> = {
  LOW: 'bar-safe',
  MEDIUM: 'bar-spam',
  HIGH: 'bar-suspicious',
  CRITICAL: 'bar-phishing',
};

function formatTimestamp(value: string | null): string {
  if (!value) return 'No scans yet';
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function Dashboard({ sessionId, refreshKey }: DashboardProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/stats?session_id=${encodeURIComponent(sessionId)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StatsResponse = await response.json();
        if (!cancelled) setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        if (!cancelled) setError('Could not load your dashboard — is the backend running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [sessionId, refreshKey]);

  const maxVerdict = Math.max(1, ...VERDICTS.map((key) => stats?.verdict_counts[key] ?? 0));
  const maxLevel = Math.max(1, ...LEVELS.map((key) => stats?.risk_level_counts[key] ?? 0));

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 className="dashboard-heading" id="dashboard-heading">Your dashboard</h1>
      <p className="view-sub">Everything below belongs to this guest session only.</p>

      {loading && (
        <div className="dashboard-grid" aria-busy="true">
          {[0, 1, 2, 3].map((key) => (
            <div className="stat-card" key={key}>
              <div className="skeleton skeleton-lg" />
              <div className="skeleton" style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="panel">
          <p className="history-error">{error}</p>
        </div>
      )}

      {!loading && !error && stats && stats.total_scans === 0 && (
        <div className="empty-state">
          No scans yet. Run your first scan and this dashboard will fill up with your results.
        </div>
      )}

      {!loading && !error && stats && stats.total_scans > 0 && (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_scans}</div>
              <div className="stat-label">Total scans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.threats_blocked}</div>
              <div className="stat-label">Threats flagged</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.safe_pct}%</div>
              <div className="stat-label">Came back safe</div>
            </div>
            <div className="stat-card">
              <div className="stat-value stat-value-sm">{formatTimestamp(stats.last_scan_at)}</div>
              <div className="stat-label">Last scan</div>
            </div>
          </div>

          <div className="panel">
            <h2>Verdicts</h2>
            {VERDICTS.map((verdict) => {
              const count = stats.verdict_counts[verdict] ?? 0;
              return (
                <div className="bar-row" key={verdict}>
                  <span className="bar-label">{verdict.toLowerCase()}</span>
                  <span className="bar-track">
                    <span
                      className={`bar-fill ${VERDICT_BAR[verdict]}`}
                      style={{ width: `${(count / maxVerdict) * 100}%` }}
                    />
                  </span>
                  <span className="bar-count">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <h2>Risk levels</h2>
            {LEVELS.map((level) => {
              const count = stats.risk_level_counts[level] ?? 0;
              return (
                <div className="bar-row" key={level}>
                  <span className="bar-label">{level.toLowerCase()}</span>
                  <span className="bar-track">
                    <span
                      className={`bar-fill ${LEVEL_BAR[level]}`}
                      style={{ width: `${(count / maxLevel) * 100}%` }}
                    />
                  </span>
                  <span className="bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
