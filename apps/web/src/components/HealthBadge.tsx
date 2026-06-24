// Full class strings (no dynamic construction) so Tailwind keeps them.
const HEALTH_CLASSES: Record<string, string> = {
  EXCELLENT: 'bg-green-100 text-green-800 border-green-200',
  GOOD: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  MODERATE: 'bg-amber-100 text-amber-800 border-amber-200',
  POOR: 'bg-red-100 text-red-800 border-red-200',
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
      <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        unscored
      </span>
    );
  }
  const cls = HEALTH_CLASSES[rating] ?? HEALTH_CLASSES.MODERATE;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
      title={`Health ${score}/100`}
    >
      {rating} · {score}
    </span>
  );
}
