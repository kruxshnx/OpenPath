// String-literal types that mirror the Prisma enums exactly. The pure scorers
// stay free of any Prisma import (so they run without a DB); the persistence
// layer casts these to the generated enum types.

export type HealthRatingLiteral = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
export type DifficultyLevelLiteral = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'ADVANCED';
export type TimeBucketLiteral =
  | 'ONE_TO_TWO_HOURS'
  | 'HALF_DAY'
  | 'ONE_TO_TWO_DAYS'
  | 'MULTIPLE_DAYS';

// --- Health (TECHNICAL_PLAN.md §5a) ---

export interface RepoHealthSignals {
  pushedAt: Date | null;
  stars: number;
  forks: number;
  totalIssues: number; // issues we have ingested
  closedIssues: number;
  medianResolutionHours: number | null;
  openIssuesCount: number; // GitHub's reported count
  now: Date;
}

export interface HealthResult {
  score: number; // 0..100
  rating: HealthRatingLiteral;
  breakdown: {
    activity: number | null;
    popularity: number | null;
    responsiveness: number | null;
    issueManagement: number | null;
    appliedWeights: Record<string, number>;
    notes: string[];
  };
}

// --- Issue difficulty (TECHNICAL_PLAN.md §5b) ---

export interface IssueFeaturesInput {
  title: string;
  body: string | null;
  labels: string[];
  commentsCount: number;
}

export interface DifficultyFeatures {
  titleLength: number;
  bodyLength: number;
  codeBlockCount: number;
  checklistItems: number;
  linkCount: number;
  labelCount: number;
  hasBeginnerLabel: boolean;
  hasHelpWantedLabel: boolean;
  hasHardLabel: boolean;
  commentsCount: number;
}

export interface DifficultyResult {
  level: DifficultyLevelLiteral;
  score: number; // 0..1, higher = harder
  estimatedTimeBucket: TimeBucketLiteral;
  features: DifficultyFeatures;
}
