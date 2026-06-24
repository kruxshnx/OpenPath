const DIFF_CLASSES: Record<string, string> = {
  BEGINNER: 'bg-sky-100 text-sky-800',
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  ADVANCED: 'bg-red-100 text-red-800',
};

const ETA_LABEL: Record<string, string> = {
  ONE_TO_TWO_HOURS: '1–2h',
  HALF_DAY: 'half day',
  ONE_TO_TWO_DAYS: '1–2 days',
  MULTIPLE_DAYS: 'multi-day',
};

export function DifficultyChip({
  level,
  eta,
}: {
  level: string | null;
  eta?: string | null;
}) {
  if (!level) {
    return (
      <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
        unscored
      </span>
    );
  }
  const cls = DIFF_CLASSES[level] ?? DIFF_CLASSES.MEDIUM;
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {level}
      {eta && ETA_LABEL[eta] ? ` · ${ETA_LABEL[eta]}` : ''}
    </span>
  );
}
