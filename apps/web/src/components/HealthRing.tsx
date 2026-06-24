const RATING_COLOR: Record<string, string> = {
  EXCELLENT: '#10b981',
  GOOD: '#22c55e',
  MODERATE: '#f59e0b',
  POOR: '#ef4444',
};

// Radial progress ring for a repository health score.
export function HealthRing({
  score,
  rating,
  size = 76,
  stroke = 7,
}: {
  score: number | null;
  rating: string | null;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const color = (rating && RATING_COLOR[rating]) || '#94a3b8';

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={score == null ? 'Health: unscored' : `Health ${score} of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="text-muted"
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-semibold tabular-nums leading-none">
          {score == null ? '—' : score}
        </span>
        <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          health
        </span>
      </div>
    </div>
  );
}
