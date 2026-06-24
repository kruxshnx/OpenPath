import { SKILL_CATALOG, type SkillSeedType } from '@openpath/db';

export interface UserSkillInput {
  name: string;
  type: SkillSeedType;
  weight: number;
}

export interface RepoSkillSignals {
  primaryLanguage: string | null;
  languages: { language: string; bytes: number }[];
  topics: string[];
}

export interface SkillMatchResult {
  score: number; // 0..100
  matched: string[];
  unmatched: string[];
  repoSkills: string[];
}

// Resolve raw GitHub signals (language names, topics, shorthand) to canonical
// skill names via the shared taxonomy + alias table (TECHNICAL_PLAN.md §4).
const aliasIndex = buildAliasIndex();

function buildAliasIndex(): Map<string, { name: string; type: SkillSeedType }> {
  const m = new Map<string, { name: string; type: SkillSeedType }>();
  for (const s of SKILL_CATALOG) {
    m.set(s.name.toLowerCase(), { name: s.name, type: s.type });
    for (const a of s.aliases) m.set(a.toLowerCase(), { name: s.name, type: s.type });
  }
  return m;
}

export function resolveSkill(
  raw: string,
): { name: string; type: SkillSeedType } | undefined {
  return aliasIndex.get(raw.toLowerCase().trim());
}

export function detectRepoSkills(
  repo: RepoSkillSignals,
): Map<string, SkillSeedType> {
  const skills = new Map<string, SkillSeedType>();
  for (const l of repo.languages) {
    const r = resolveSkill(l.language);
    if (r) skills.set(r.name, r.type);
  }
  for (const t of repo.topics) {
    const r = resolveSkill(t);
    if (r) skills.set(r.name, r.type);
  }
  if (repo.primaryLanguage) {
    const r = resolveSkill(repo.primaryLanguage);
    if (r) skills.set(r.name, r.type);
  }
  return skills;
}

// Relative importance of a skill type when scoring coverage.
const TYPE_IMPORTANCE: Record<SkillSeedType, number> = {
  LANGUAGE: 1.0,
  FRAMEWORK: 0.8,
  DOMAIN: 0.6,
  TOOL: 0.5,
};

/**
 * Coverage-based skill match: what share of the user's (importance-weighted)
 * skills does the repository's stack cover? A matched primary language counts
 * extra. Returns 0..100 plus the matched/unmatched breakdown.
 */
export function computeSkillMatch(
  userSkills: UserSkillInput[],
  repo: RepoSkillSignals,
): SkillMatchResult {
  const repoSkills = detectRepoSkills(repo);
  const primary = repo.primaryLanguage
    ? resolveSkill(repo.primaryLanguage)?.name
    : undefined;

  let total = 0;
  let matchedImportance = 0;
  const matched: string[] = [];
  const unmatched: string[] = [];

  for (const us of userSkills) {
    const resolved = resolveSkill(us.name) ?? { name: us.name, type: us.type };
    const importance = (TYPE_IMPORTANCE[us.type] ?? 0.5) * (us.weight || 1);
    total += importance;

    if (repoSkills.has(resolved.name)) {
      const bonus = primary === resolved.name ? 1.25 : 1;
      matchedImportance += importance * bonus;
      matched.push(resolved.name);
    } else {
      unmatched.push(resolved.name);
    }
  }

  const score =
    total > 0 ? Math.min(100, Math.round((matchedImportance / total) * 100)) : 0;
  return { score, matched, unmatched, repoSkills: [...repoSkills.keys()] };
}
