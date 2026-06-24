const HEALTH_CLASSES: Record<string, string> = {
  EXCELLENT:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20',
  GOOD: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-400/20',
  MODERATE:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20',
  POOR: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20',
};

export function HealthBadge({
  score,
  rating,
}: {
  score: number | null;
  rating: string | null;
}) {
  if (score == null || rating == null) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
        unscored
      </span>
    );
  }
  const cls = HEALTH_CLASSES[rating] ?? HEALTH_CLASSES.MODERATE;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
      title={`Health ${score}/100`}
    >
      {rating}
      <span className="font-mono tabular-nums opacity-70">{score}</span>
    </span>
  );
}
