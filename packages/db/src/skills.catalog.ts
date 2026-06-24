// Controlled skill vocabulary (TECHNICAL_PLAN.md §4). The `aliases` map raw
// GitHub signals (topics, manifest tokens, common shorthand) to a canonical
// skill name, so user profiles, repo stacks, and search all share one taxonomy.

export type SkillSeedType = 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'DOMAIN';

export interface SkillSeed {
  name: string;
  type: SkillSeedType;
  aliases: string[];
}

export const SKILL_CATALOG: SkillSeed[] = [
  // --- Languages ---
  { name: 'JavaScript', type: 'LANGUAGE', aliases: ['js', 'node', 'nodejs', 'ecmascript'] },
  { name: 'TypeScript', type: 'LANGUAGE', aliases: ['ts'] },
  { name: 'Python', type: 'LANGUAGE', aliases: ['py', 'python3'] },
  { name: 'Java', type: 'LANGUAGE', aliases: ['jvm'] },
  { name: 'C++', type: 'LANGUAGE', aliases: ['cpp', 'cplusplus'] },
  { name: 'C', type: 'LANGUAGE', aliases: [] },
  { name: 'C#', type: 'LANGUAGE', aliases: ['csharp', 'dotnet'] },
  { name: 'Go', type: 'LANGUAGE', aliases: ['golang'] },
  { name: 'Rust', type: 'LANGUAGE', aliases: ['rs'] },
  { name: 'Ruby', type: 'LANGUAGE', aliases: ['rb'] },
  { name: 'PHP', type: 'LANGUAGE', aliases: [] },
  { name: 'Kotlin', type: 'LANGUAGE', aliases: ['kt'] },
  { name: 'Swift', type: 'LANGUAGE', aliases: [] },

  // --- Frameworks ---
  { name: 'React', type: 'FRAMEWORK', aliases: ['reactjs', 'react.js'] },
  { name: 'Next.js', type: 'FRAMEWORK', aliases: ['nextjs', 'next'] },
  { name: 'Angular', type: 'FRAMEWORK', aliases: ['angularjs'] },
  { name: 'Vue', type: 'FRAMEWORK', aliases: ['vuejs', 'vue.js'] },
  { name: 'Node.js', type: 'FRAMEWORK', aliases: ['node', 'nodejs'] },
  { name: 'Express', type: 'FRAMEWORK', aliases: ['expressjs'] },
  { name: 'Spring Boot', type: 'FRAMEWORK', aliases: ['spring', 'springboot'] },
  { name: 'Django', type: 'FRAMEWORK', aliases: [] },
  { name: 'Flask', type: 'FRAMEWORK', aliases: [] },

  // --- Tools / platforms ---
  { name: 'Docker', type: 'TOOL', aliases: ['dockerfile', 'containers'] },
  { name: 'Kubernetes', type: 'TOOL', aliases: ['k8s'] },
  { name: 'AWS', type: 'TOOL', aliases: ['amazon-web-services'] },
  { name: 'PostgreSQL', type: 'TOOL', aliases: ['postgres', 'psql'] },
  { name: 'Redis', type: 'TOOL', aliases: [] },
  { name: 'Git', type: 'TOOL', aliases: [] },
  { name: 'GitHub Actions', type: 'TOOL', aliases: ['github-actions', 'gha', 'ci'] },
  { name: 'Terraform', type: 'TOOL', aliases: ['iac'] },

  // --- Domains / areas of interest ---
  { name: 'Web Development', type: 'DOMAIN', aliases: ['web', 'frontend', 'backend', 'fullstack'] },
  { name: 'AI/ML', type: 'DOMAIN', aliases: ['ai', 'ml', 'machine-learning', 'deep-learning', 'llm'] },
  { name: 'Cybersecurity', type: 'DOMAIN', aliases: ['security', 'infosec', 'appsec'] },
  { name: 'Cloud Computing', type: 'DOMAIN', aliases: ['cloud'] },
  { name: 'DevOps', type: 'DOMAIN', aliases: ['sre', 'platform'] },
  { name: 'Blockchain', type: 'DOMAIN', aliases: ['web3', 'crypto', 'smart-contracts'] },
  { name: 'Mobile Development', type: 'DOMAIN', aliases: ['mobile', 'android', 'ios'] },
  { name: 'Data Engineering', type: 'DOMAIN', aliases: ['data', 'etl', 'data-pipeline'] },
];
