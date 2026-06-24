import {
  prisma,
  Prisma,
  type DifficultyLevel,
  type SkillSeedType,
} from '@openpath/db';
import { popularityScore } from '../scoring/health';
import type { DifficultyLevelLiteral } from '../scoring/types';
import {
  rankRepositories,
  type ExperienceLevel,
  type UserProfile,
} from './recommend';

/**
 * Generates and persists ranked recommendations for a user from already-scored
 * repositories in the database. Replaces the user's previous recommendations.
 */
export async function generateRecommendations(userId: string, limit = 20) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: { include: { skill: true } } },
  });
  if (!user) throw new Error(`User not found: ${userId}`);

  const profile: UserProfile = {
    skills: user.skills.map((us) => ({
      name: us.skill.name,
      type: us.skill.type as SkillSeedType,
      weight: us.weight,
    })),
    experienceLevel: user.experienceLevel as ExperienceLevel,
    interests: user.interests,
  };

  const repos = await prisma.repository.findMany({
    where: { healthScore: { not: null }, archived: false },
    include: {
      languages: true,
      topics: true,
      issues: { select: { difficultyLevel: true } },
    },
    take: 300,
  });

  const candidates = repos.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    signals: {
      primaryLanguage: r.primaryLanguage,
      languages: r.languages.map((l) => ({ language: l.language, bytes: l.bytes })),
      topics: r.topics.map((t) => t.topic),
    },
    health: r.healthScore ?? 0,
    popularity: popularityScore(r.stars, r.forks),
    issueDifficulties: r.issues
      .map((i) => i.difficultyLevel)
      .filter((d): d is DifficultyLevel => d != null) as DifficultyLevelLiteral[],
    topics: r.topics.map((t) => t.topic),
  }));

  const ranked = rankRepositories(profile, candidates).slice(0, limit);

  await prisma.recommendation.deleteMany({ where: { userId } });
  if (ranked.length) {
    await prisma.recommendation.createMany({
      data: ranked.map((rec) => ({
        userId,
        repositoryId: rec.id,
        skillMatchScore: rec.skillMatch.score,
        compositeScore: rec.compositeScore,
        scoreBreakdown: {
          factors: rec.factors,
          matchedSkills: rec.skillMatch.matched,
          suitableIssues: rec.issueFit.suitableCount,
        } as unknown as Prisma.InputJsonValue,
      })),
    });
  }

  return {
    userId,
    count: ranked.length,
    top: ranked
      .slice(0, 5)
      .map((r) => ({ repo: r.fullName, score: r.compositeScore })),
  };
}
