import type { DifficultyLevelLiteral } from '../scoring/types';
import {
  computeSkillMatch,
  resolveSkill,
  type RepoSkillSignals,
  type SkillMatchResult,
  type UserSkillInput,
} from '../matching/skill-match';

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface RecommendationFactors {
  skillMatch: number;
  health: number;
  issueFit: number;
  popularity: number;
  interestMatch: number;
}

// Composite weights (TECHNICAL_PLAN.md §6). Maintainer responsiveness is already
// folded into the health score, so it is not double-counted here. Sum = 1.
const WEIGHTS: RecommendationFactors = {
  skillMatch: 0.35,
  health: 0.25,
  issueFit: 0.15,
  popularity: 0.1,
  interestMatch: 0.15,
};

export function computeRecommendationScore(f: RecommendationFactors): number {
  const s =
    WEIGHTS.skillMatch * f.skillMatch +
    WEIGHTS.health * f.health +
    WEIGHTS.issueFit * f.issueFit +
    WEIGHTS.popularity * f.popularity +
    WEIGHTS.interestMatch * f.interestMatch;
  return Math.round(s * 10) / 10;
}

// Difficulty levels considered a good fit for each experience level.
const SUITABLE: Record<ExperienceLevel, DifficultyLevelLiteral[]> = {
  BEGINNER: ['BEGINNER', 'EASY'],
  INTERMEDIATE: ['EASY', 'MEDIUM'],
  ADVANCED: ['MEDIUM', 'ADVANCED'],
};

export function computeIssueFit(
  level: ExperienceLevel,
  issueDifficulties: DifficultyLevelLiteral[],
): { score: number; suitableCount: number } {
  if (issueDifficulties.length === 0) return { score: 0, suitableCount: 0 };
  const suitable = SUITABLE[level];
  const suitableCount = issueDifficulties.filter((d) =>
    suitable.includes(d),
  ).length;
  return {
    score: Math.round((suitableCount / issueDifficulties.length) * 100),
    suitableCount,
  };
}

// Overlap between the user's interests and the repo's topics/skills, resolved
// through the taxonomy so "ai" matches "AI/ML", "k8s" matches "Kubernetes", etc.
export function computeInterestMatch(
  interests: string[],
  repoTags: string[],
): number {
  if (interests.length === 0) return 0;
  const repoCanonical = new Set(
    repoTags.map((t) => resolveSkill(t)?.name ?? t.toLowerCase()),
  );
  const hits = interests.filter((i) => {
    const canonical = resolveSkill(i)?.name ?? i.toLowerCase();
    return repoCanonical.has(canonical);
  }).length;
  return Math.round((hits / interests.length) * 100);
}

export interface UserProfile {
  skills: UserSkillInput[];
  experienceLevel: ExperienceLevel;
  interests: string[];
}

export interface CandidateRepo {
  id: string;
  fullName: string;
  signals: RepoSkillSignals;
  health: number; // 0..100
  popularity: number; // 0..100
  issueDifficulties: DifficultyLevelLiteral[];
  topics: string[];
}

export interface RankedRecommendation {
  id: string;
  fullName: string;
  compositeScore: number;
  factors: RecommendationFactors;
  skillMatch: SkillMatchResult;
  issueFit: { score: number; suitableCount: number };
}

/**
 * Scores and ranks candidate repositories for a user, highest composite first.
 */
export function rankRepositories(
  user: UserProfile,
  candidates: CandidateRepo[],
): RankedRecommendation[] {
  const ranked = candidates.map((c) => {
    const skillMatch = computeSkillMatch(user.skills, c.signals);
    const issueFit = computeIssueFit(user.experienceLevel, c.issueDifficulties);
    const interestMatch = computeInterestMatch(user.interests, [
      ...c.topics,
      ...skillMatch.repoSkills,
    ]);

    const factors: RecommendationFactors = {
      skillMatch: skillMatch.score,
      health: c.health,
      issueFit: issueFit.score,
      popularity: c.popularity,
      interestMatch,
    };

    return {
      id: c.id,
      fullName: c.fullName,
      compositeScore: computeRecommendationScore(factors),
      factors,
      skillMatch,
      issueFit,
    };
  });

  return ranked.sort((a, b) => b.compositeScore - a.compositeScore);
}
