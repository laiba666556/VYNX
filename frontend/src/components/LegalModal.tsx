import { useEffect, useRef } from 'react';

interface LegalModalProps {
  onClose: () => void;
}

function LegalModal({ onClose }: LegalModalProps) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="legal-title">Terms &amp; Privacy</h2>
        <p>Last updated: 2 September 2026. VYNX is a hackathon prototype for phishing and scam awareness in Pakistan.</p>

        <h3>What we store</h3>
        <ul>
          <li>The type of scan (URL, message, or email), risk score, verdict, risk level, triggered signals, and a timestamp.</li>
          <li>A random session id generated in your browser, used only to keep your history separate from other demo users.</li>
        </ul>

        <h3>What we never ask for</h3>
        <ul>
          <li>No account, no email address, no phone number, no password. There is nothing to reset because nothing is registered.</li>
          <li>Sign-out deletes the session id from this browser, so the app stops showing that history on this device.</li>
        </ul>

        <h3>Where your text goes</h3>
        <p>
          Everything you paste is analysed by the on-device rule engine first. If the operator has configured a Qwen API
          key, the same text is also sent to Alibaba Cloud DashScope for a second opinion. Without a key, no text leaves
          the machine and the app labels results as rule-engine only.
        </p>

        <h3>Fair use</h3>
        <ul>
          <li>Scan content you are allowed to see. Do not paste other people's private messages or credentials.</li>
          <li>A verdict is a risk signal, not a guarantee. A SAFE result does not prove a link is legitimate, and a
              PHISHING result does not prove intent. Always confirm money requests through a known official channel.</li>
          <li>Do not use VYNX to test attack infrastructure at scale — the API is rate limited to 20 scans per minute.</li>
        </ul>

        <button type="button" className="modal-close" ref={closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default LegalModal;
