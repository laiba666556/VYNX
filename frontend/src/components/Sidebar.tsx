import type { ViewState } from '../types';

interface SidebarProps {
  view: ViewState;
  onNavigate: (view: ViewState) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignOut: () => void;
  onOpenLegal: () => void;
}

const LINKS: Array<{ id: ViewState; label: string }> = [
  { id: 'scanner', label: 'Scanner' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'history', label: 'History' },
];

function Sidebar({ view, onNavigate, theme, onToggleTheme, onSignOut, onOpenLegal }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="side-brand">
        <img src="/logo.svg" alt="" width="30" height="30" />
        <span className="wordmark">VYNX</span>
      </div>

      <nav className="side-nav" aria-label="Main">
        {LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            className={`side-link ${view === link.id ? 'active' : ''}`}
            aria-current={view === link.id ? 'page' : undefined}
            onClick={() => onNavigate(link.id)}
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="side-footer">
        <p className="guest-badge">Guest session — no account, history stays on this device.</p>
        <div className="side-actions">
          <button type="button" className="theme-toggle" onClick={onToggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button type="button" className="signout-button" onClick={onSignOut}>
            Sign out
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
