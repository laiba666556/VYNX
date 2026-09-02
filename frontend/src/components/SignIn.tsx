interface SignInProps {
  onSignIn: () => void;
  onOpenLegal: () => void;
}

function SignIn({ onSignIn, onOpenLegal }: SignInProps) {
  return (
    <div className="sign-in-wrap">
      <main className="sign-in-card">
        <img className="sign-in-logo" src="/logo.svg" alt="" width="64" height="64" />
        <h1 className="wordmark">VYNX</h1>
        <p className="tagline">
          AI-powered phishing and scam detection for Pakistan. Check a suspicious link, SMS, or email in English,
          Roman-Urdu, or Urdu before you act on it.
        </p>
        <button type="button" className="sign-in-button" onClick={onSignIn}>
          Continue as guest
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
