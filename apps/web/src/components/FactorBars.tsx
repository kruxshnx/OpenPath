const FACTOR_LABELS: [string, string][] = [
  ['skillMatch', 'Skill match'],
  ['health', 'Health'],
  ['issueFit', 'Issue fit'],
  ['popularity', 'Popularity'],
  ['interestMatch', 'Interest'],
];

// Horizontal bars visualizing the weighted recommendation factors.
export function FactorBars({
  factors,
}: {
  factors: Record<string, number> | null;
}) {
  if (!factors) return null;
  return (
    <div className="space-y-1.5">
      {FACTOR_LABELS.map(([key, label]) => {
        const value = Math.round(factors[key] ?? 0);
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-7 shrink-0 text-right font-mono tabular-nums text-foreground">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
