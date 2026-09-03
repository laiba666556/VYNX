import { ArrowRight, ShieldCheck, Sparkles, Lock, Globe } from 'lucide-react';

interface SignInProps {
  onSignIn: () => void;
  onOpenLegal: () => void;
}

function SignIn({ onSignIn, onOpenLegal }: SignInProps) {
  return (
    <div className="sign-in-wrap">
      {/* Decorative ambient background glows inspired by reference image */}
      <div className="ambient-orb orb-1" aria-hidden="true" />
      <div className="ambient-orb orb-2" aria-hidden="true" />
      <div className="ambient-orb orb-3" aria-hidden="true" />

      <main className="sign-in-card">
        {/* Holographic / Iridescent AI Core Orb inspired by the center screen */}
        <div className="ai-core-container" aria-hidden="true">
          <div className="ai-orb">
            <div className="ai-orb-glow" />
            <div className="ai-orb-specular" />
          </div>
          <div className="ai-orb-ring" />
          <div className="ai-orb-ring-2" />
        </div>

        <div className="sign-in-header">
          <div className="sign-in-badge">
            <Sparkles size={14} className="spark-icon" />
            <span>AI Cyber Sentinel</span>
          </div>
          <h1 className="wordmark sign-in-title">VYNX</h1>
          <p className="tagline">
            AI-powered phishing and scam detection for Pakistan. Check a suspicious link, SMS, or email in English,
            Roman-Urdu, or Urdu before you act on it.
          </p>
        </div>

        {/* Feature badges inspired by the reference 4-card layout */}
        <div className="sign-in-features" aria-label="Key features">
          <div className="feature-chip">
            <span className="feature-chip-icon">
              <Globe size={15} />
            </span>
            <span>Urdu &amp; Roman-Urdu Multilingual</span>
          </div>
          <div className="feature-chip">
            <span className="feature-chip-icon">
              <ShieldCheck size={15} />
            </span>
            <span>Pakistani Bank &amp; Telco Rules</span>
          </div>
          <div className="feature-chip">
            <span className="feature-chip-icon">
              <Lock size={15} />
            </span>
            <span>Zero-Log Private Session</span>
          </div>
        </div>

        <button type="button" className="sign-in-button" onClick={onSignIn}>
          <span>Continue as guest</span>
          <ArrowRight size={18} className="button-arrow" />
        </button>

        <p className="privacy-note">
          No email, no password — a random session id is stored in this browser only.{' '}
          <button type="button" className="terms-button" onClick={onOpenLegal}>
            Terms &amp; Privacy
          </button>
        </p>
      </main>
    </div>
  );
}

export default SignIn;
