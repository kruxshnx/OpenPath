-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('LANGUAGE', 'FRAMEWORK', 'TOOL', 'DOMAIN');

-- CreateEnum
CREATE TYPE "SkillSource" AS ENUM ('SELF_REPORTED', 'INFERRED_FROM_REPOS');

-- CreateEnum
CREATE TYPE "HealthRating" AS ENUM ('EXCELLENT', 'GOOD', 'MODERATE', 'POOR');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'EASY', 'MEDIUM', 'ADVANCED');

-- CreateEnum
CREATE TYPE "EstimatedTimeBucket" AS ENUM ('ONE_TO_TWO_HOURS', 'HALF_DAY', 'ONE_TO_TWO_DAYS', 'MULTIPLE_DAYS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" BIGINT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "email" TEXT,
    "accessToken" TEXT,
    "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "interests" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SkillType" NOT NULL,
    "aliases" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "source" "SkillSource" NOT NULL DEFAULT 'SELF_REPORTED',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("userId","skillId")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "githubId" BIGINT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "primaryLanguage" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "watchers" INTEGER NOT NULL DEFAULT 0,
    "openIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "contributorsCount" INTEGER NOT NULL DEFAULT 0,
    "pushedAt" TIMESTAMP(3),
    "repoCreatedAt" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "healthScore" DOUBLE PRECISION,
    "healthRating" "HealthRating",
    "healthBreakdown" JSONB,
    "lastIngestedAt" TIMESTAMP(3),
    "lastScoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryLanguage" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,

    CONSTRAINT "RepositoryLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryTopic" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,

    CONSTRAINT "RepositoryTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "githubId" BIGINT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" TEXT NOT NULL,
    "labels" TEXT[],
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "issueCreatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "closedByFirstTimeContributor" BOOLEAN,
    "resolutionHours" DOUBLE PRECISION,
    "difficultyLevel" "DifficultyLevel",
    "difficultyScore" DOUBLE PRECISION,
    "estimatedTimeBucket" "EstimatedTimeBucket",
    "difficultyFeatures" JSONB,
    "lastScoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintainer" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "githubLogin" TEXT NOT NULL,
    "medianIssueResponseHours" DOUBLE PRECISION,
    "medianPrReviewHours" DOUBLE PRECISION,
    "mergeRate" DOUBLE PRECISION,
    "friendlinessScore" DOUBLE PRECISION,
    "lastActiveAt" TIMESTAMP(3),

    CONSTRAINT "Maintainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryMetric" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stars" INTEGER NOT NULL,
    "forks" INTEGER NOT NULL,
    "openIssues" INTEGER NOT NULL,
    "commitCount30d" INTEGER,
    "releaseCount90d" INTEGER,

    CONSTRAINT "RepositoryMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "issueId" TEXT,
    "skillMatchScore" DOUBLE PRECISION NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "UserSkill_skillId_idx" ON "UserSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubId_key" ON "Repository"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");

-- CreateIndex
CREATE INDEX "Repository_healthScore_idx" ON "Repository"("healthScore" DESC);

-- CreateIndex
CREATE INDEX "Repository_primaryLanguage_idx" ON "Repository"("primaryLanguage");

-- CreateIndex
CREATE INDEX "RepositoryLanguage_language_idx" ON "RepositoryLanguage"("language");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryLanguage_repositoryId_language_key" ON "RepositoryLanguage"("repositoryId", "language");

-- CreateIndex
CREATE INDEX "RepositoryTopic_topic_idx" ON "RepositoryTopic"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryTopic_repositoryId_topic_key" ON "RepositoryTopic"("repositoryId", "topic");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_githubId_key" ON "Issue"("githubId");

-- CreateIndex
CREATE INDEX "Issue_repositoryId_state_idx" ON "Issue"("repositoryId", "state");

-- CreateIndex
CREATE INDEX "Issue_difficultyLevel_idx" ON "Issue"("difficultyLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_repositoryId_number_key" ON "Issue"("repositoryId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Maintainer_repositoryId_githubLogin_key" ON "Maintainer"("repositoryId", "githubLogin");

-- CreateIndex
CREATE INDEX "RepositoryMetric_repositoryId_capturedAt_idx" ON "RepositoryMetric"("repositoryId", "capturedAt");

-- CreateIndex
CREATE INDEX "Recommendation_userId_compositeScore_idx" ON "Recommendation"("userId", "compositeScore" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_userId_repositoryId_issueId_key" ON "Recommendation"("userId", "repositoryId", "issueId");

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryLanguage" ADD CONSTRAINT "RepositoryLanguage_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryTopic" ADD CONSTRAINT "RepositoryTopic_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintainer" ADD CONSTRAINT "Maintainer_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryMetric" ADD CONSTRAINT "RepositoryMetric_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

