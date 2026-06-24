import type { HealthResult, RepoHealthSignals } from './types';
import { clamp, round } from './util';

const DAY_MS = 1000 * 60 * 60 * 24;
const WEEK_HOURS = 24 * 7;

// Base weights; renormalized over whichever components actually have data so a
// repo with no closed issues isn't unfairly penalized (TECHNICAL_PLAN.md §5a).
const BASE_WEIGHTS = {
  activity: 0.35,
  popularity: 0.25,
  responsiveness: 0.25,
  issueManagement: 0.15,
} as const;

type Component = keyof typeof BASE_WEIGHTS;

// Log-scaled popularity from stars (with a small forks contribution). Exported
// so the recommendation engine reuses the exact same definition.
export function popularityScore(stars: number, forks: number): number {
  const starScore = (Math.log10(stars + 1) / Math.log10(100000)) * 100;
  const forkScore = (Math.log10(forks + 1) / Math.log10(50000)) * 100;
  return round(clamp(0.8 * starScore + 0.2 * forkScore));
}

export function computeHealth(s: RepoHealthSignals): HealthResult {
  const notes: string[] = [];

  // Activity: exponential decay on days since last push (~90-day scale).
  let activity: number | null = null;
  if (s.pushedAt) {
    const days = Math.max(0, (s.now.getTime() - s.pushedAt.getTime()) / DAY_MS);
    activity = round(clamp(100 * Math.exp(-days / 90)));
  } else {
    notes.push('no pushedAt; activity excluded');
  }

  // Popularity: log-scaled stars with a small forks contribution (always present).
  const popularity = popularityScore(s.stars, s.forks);

  // Responsiveness: decay on median issue resolution time (1 week ~ 37).
  let responsiveness: number | null = null;
  if (s.medianResolutionHours != null) {
    responsiveness = round(
      clamp(100 * Math.exp(-s.medianResolutionHours / WEEK_HOURS)),
    );
  } else {
    notes.push('no resolved issues; responsiveness excluded');
  }

  // Issue management: share of known issues that are closed.
  let issueManagement: number | null = null;
  if (s.totalIssues > 0) {
    issueManagement = round(clamp((s.closedIssues / s.totalIssues) * 100));
  } else {
    notes.push('no issues sampled; issueManagement excluded');
  }

  const components: Array<[Component, number | null]> = [
    ['activity', activity],
    ['popularity', popularity],
    ['responsiveness', responsiveness],
    ['issueManagement', issueManagement],
  ];

  const available = components.filter(
    (c): c is [Component, number] => c[1] != null,
  );
  const weightSum = available.reduce((acc, [k]) => acc + BASE_WEIGHTS[k], 0);

  const appliedWeights: Record<string, number> = {};
  let score = 0;
  for (const [k, v] of available) {
    const w = BASE_WEIGHTS[k] / weightSum;
    appliedWeights[k] = round(w, 2);
    score += w * v;
  }
  score = round(score);

  const rating =
    score >= 80
      ? 'EXCELLENT'
      : score >= 60
        ? 'GOOD'
        : score >= 40
          ? 'MODERATE'
          : 'POOR';

  return {
    score,
    rating,
    breakdown: {
      activity,
      popularity,
      responsiveness,
      issueManagement,
      appliedWeights,
      notes,
    },
  };
}
