const DIFF_CLASSES: Record<string, string> = {
  BEGINNER:
    'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-400/20',
  EASY: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20',
  MEDIUM:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20',
  ADVANCED:
    'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-400/20',
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
      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        unscored
      </span>
    );
  }
  const cls = DIFF_CLASSES[level] ?? DIFF_CLASSES.MEDIUM;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {level}
      {eta && ETA_LABEL[eta] && (
        <span className="opacity-70">· {ETA_LABEL[eta]}</span>
      )}
    </span>
  );
}
