// Circular match score (0-100). Green from 70, amber from 40, red below.
const ringColor = (score) => (score >= 70 ? '#198754' : score >= 40 ? '#d98e04' : '#dc3545');

const ScoreRing = ({ score, size = 64 }) => {
  const stroke = Math.max(5, size / 10);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="score-ring" style={{ width: size, height: size }} role="img" aria-label={`Match score ${value} percent`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e9f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor(value)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span style={{ fontSize: size / 3.4 }}>{value}%</span>
    </div>
  );
};

export default ScoreRing;
