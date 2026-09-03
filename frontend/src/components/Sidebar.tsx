import type { ViewState } from '../types';
import {
  ScanLine,
  LayoutDashboard,
  Clock,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  view: ViewState;
  onNavigate: (view: ViewState) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignOut: () => void;
  onOpenLegal: () => void;
}

const LINKS: Array<{ id: ViewState; label: string; icon: typeof ScanLine }> = [
  { id: 'scanner', label: 'Scanner', icon: ScanLine },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: Clock },
];

function Sidebar({ view, onNavigate, theme, onToggleTheme, onSignOut, onOpenLegal }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="side-brand">
        <div className="brand-logo-wrap">
          <img src="/logo.png" alt="" width="38" height="38" />
        </div>
        <div className="brand-text-wrap">
          <span className="wordmark">VYNX</span>
          <span className="brand-sub">
            <span className="live-dot" aria-hidden="true" />
            <span>Cyber Guard</span>
          </span>
        </div>
      </div>

      <nav className="side-nav" aria-label="Main">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              type="button"
              className={`side-link ${view === link.id ? 'active' : ''}`}
              aria-current={view === link.id ? 'page' : undefined}
              onClick={() => onNavigate(link.id)}
            >
              <span className="side-link-icon">
                <Icon size={18} strokeWidth={2} />
              </span>
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="side-footer">
        <div className="guest-badge">
          <Sparkles size={14} className="guest-icon" />
          <span>Guest session — no account, history stays on this device.</span>
        </div>
        <div className="side-actions">
          <button type="button" className="theme-toggle" onClick={onToggleTheme}>
            {theme === 'dark' ? (
              <>
                <Sun size={15} />
                <span>Light mode</span>
              </>
            ) : (
              <>
                <Moon size={15} />
                <span>Dark mode</span>
              </>
            )}
          </button>
          <button type="button" className="signout-button" onClick={onSignOut}>
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
        <button type="button" className="terms-button report-link" onClick={onOpenLegal}>
          Terms &amp; Privacy
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
