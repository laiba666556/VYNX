interface RiskMeterProps {
  score: number;
  level: string;
}

function RiskMeter({ score, level }: RiskMeterProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const levelClass = `risk-meter-progress--${level.toLowerCase()}`;
 
  return (
    <div className="risk-meter-container">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        role="img"
        aria-label={`Risk score ${clamped} out of 100, level ${level}`}
      >
        <circle className="risk-meter-track" cx="70" cy="70" r={radius} fill="none" strokeWidth="10" />
        <circle
          className={`risk-meter-progress ${levelClass}`}
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
        <text className="risk-meter-text" x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="700">
          {clamped}
        </text>
        <text className="risk-max" x="70" y="90" textAnchor="middle" fontSize="12">
          / 100
        </text>
      </svg>
    </div>
  );
}

export default RiskMeter;