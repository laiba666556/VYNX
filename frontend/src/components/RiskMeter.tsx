import React, { useEffect, useState } from 'react';

interface RiskMeterProps {
  score: number;
  level: string;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score, level }) => {
  const [offset, setOffset] = useState(326.7);
  
  // Determine color based on level
  const getColor = () => {
    switch(level) {
      case 'LOW': return '#22c55e';
      case 'MEDIUM': return '#eab308';
      case 'HIGH': return '#f97316';
      case 'CRITICAL': return '#ef4444';
      default: return '#22c55e';
    }
  };

  useEffect(() => {
    // Animate the progress by gradually reducing the offset
    const timer = setTimeout(() => {
      const progressOffset = 326.7 * (1 - score / 100);
      setOffset(progressOffset);
    }, 10);

    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 326.7;
  const radius = 52;
  const center = 70;

  return (
    <div className="risk-meter-container">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Progress track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          className="risk-meter-progress"
        />
      </svg>
      <div className="risk-meter-text">
        <span className="risk-score">{score}</span>
        <span className="risk-max">/100</span>
      </div>
    </div>
  );
};

export default RiskMeter;