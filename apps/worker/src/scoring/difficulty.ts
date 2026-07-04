import type { DifficultyResult, IssueFeaturesInput } from './types';

const BEGINNER_RE =
  /good[\s-]?first[\s-]?issue|beginner|easy|starter|first[\s-]?timers/i;
const HELP_WANTED_RE = /help[\s-]?wanted/i;
const HARD_RE = /epic|refactor|architecture|breaking|complex|hard|major|redesign|rfc/i;

/**
 * Heuristic issue-difficulty estimator (v1). Produces a 0..1 score (higher =
 * harder), a level, an effort bucket, and the extracted feature vector. The
 * features are stored so the learned model (docs/RESEARCH.md §5b) can be trained
 * on exactly the same inputs and compared against this baseline.
 */
export function computeDifficulty(input: IssueFeaturesInput): DifficultyResult {
  const body = input.body ?? '';
  const titleLength = input.title.length;
  const bodyLength = body.length;
  const codeBlockCount = Math.floor((body.match(/```/g)?.length ?? 0) / 2);
  const checklistItems = body.match(/^[\s>-]*\[[ xX]\]/gm)?.length ?? 0;
  const linkCount = body.match(/https?:\/\//g)?.length ?? 0;

  const labelText = input.labels.join(' ');
  const hasBeginnerLabel = BEGINNER_RE.test(labelText);
  const hasHelpWantedLabel = HELP_WANTED_RE.test(labelText);
  const hasHardLabel = HARD_RE.test(labelText);

  // Hand-tuned weighting for v1.
  let score = 0.4;
  score += Math.min(0.25, bodyLength / 4000);
  score += Math.min(0.1, codeBlockCount * 0.03);
  score += Math.min(0.05, linkCount * 0.01);
  score += Math.min(0.15, input.commentsCount * 0.01);
  if (hasHardLabel) score += 0.25;
  if (hasBeginnerLabel) score -= 0.35;

  score = Math.max(0, Math.min(1, score));
  // An explicit "good first issue" label is a strong human signal — cap it easy.
  if (hasBeginnerLabel) score = Math.min(score, 0.3);

  const level =
    score < 0.25
      ? 'BEGINNER'
      : score < 0.5
        ? 'EASY'
        : score < 0.75
          ? 'MEDIUM'
          : 'ADVANCED';

  const estimatedTimeBucket =
    score < 0.25
      ? 'ONE_TO_TWO_HOURS'
      : score < 0.5
        ? 'HALF_DAY'
        : score < 0.75
          ? 'ONE_TO_TWO_DAYS'
          : 'MULTIPLE_DAYS';

  return {
    level,
    score: Math.round(score * 1000) / 1000,
    estimatedTimeBucket,
    features: {
      titleLength,
      bodyLength,
      codeBlockCount,
      checklistItems,
      linkCount,
      labelCount: input.labels.length,
      hasBeginnerLabel,
      hasHelpWantedLabel,
      hasHardLabel,
      commentsCount: input.commentsCount,
    },
  };
}
