export interface RepoListItem {
  id: string;
  fullName: string;
  description: string | null;
  primaryLanguage: string | null;
  stars: number;
  forks: number;
  openIssuesCount: number;
  healthScore: number | null;
  healthRating: string | null;
  topics: string[];
}

export interface RepoListResponse {
  items: RepoListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IssueDto {
  number: number;
  title: string;
  state: string;
  labels: string[];
  commentsCount: number;
  resolutionHours: number | null;
  difficultyLevel: string | null;
  difficultyScore: number | null;
  estimatedTimeBucket: string | null;
}

export interface RepoDetail extends RepoListItem {
  watchers: number;
  pushedAt: string | null;
  repoCreatedAt: string | null;
  healthBreakdown: Record<string, unknown> | null;
  languages: { language: string; bytes: number }[];
  issues: IssueDto[];
}

export interface RecommendationDto {
  compositeScore: number;
  skillMatchScore: number;
  scoreBreakdown: Record<string, number> | null;
  generatedAt: string;
  repository: RepoListItem;
}

export interface SkillDto {
  id: string;
  name: string;
  type: 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'DOMAIN';
}

export interface Me {
  id: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
  email: string | null;
  experienceLevel: string;
  interests: string[];
  skills?: { name: string; type: string }[];
}
