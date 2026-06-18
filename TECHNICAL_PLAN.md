# OpenPath — Technical Plan & Architecture

> Companion to `Document.txt` (the proposal). This document turns the vision into a
> buildable, sequenced engineering plan scoped for a single M.Tech student over ~6–9 months.

---

## 0. The one constraint that shapes everything

OpenPath is described as analyzing repositories and issues "among millions of GitHub
repositories." **You cannot do this live.** GitHub's API limits are hard:

| API | Limit (authenticated) | Implication |
|-----|----------------------|-------------|
| REST | 5,000 requests / hour | ~1.4 req/sec sustained |
| GraphQL | 5,000 points / hour | Nested fetches cost multiple points |
| Search | 30 requests / minute | The bottleneck for discovery |

At 5,000 req/hour you can touch ~120,000 repos/day *if you do nothing else*. Analyzing
millions in real time is impossible, and recommendation latency must be milliseconds.

**Therefore the system is not a live search wrapper. It is a data pipeline:**

1. **Ingest** repos/issues into PostgreSQL via rate-limited background workers (offline).
2. **Score** them in batch jobs (health, difficulty) — store the results.
3. **Serve** recommendations by reading *precomputed* data — fast, no live API calls.

This also unlocks a free bulk data source for research and seeding:

- **GH Archive** (gharchive.org) — hourly dumps of *every* public GitHub event, queryable
  in **BigQuery** for free-tier volumes. Use it to (a) seed your repo/issue corpus without
  burning API quota, and (b) build *labeled* datasets for the research models (e.g. issue
  resolution time, who closed it, first-time-contributor success).
- The live GitHub API is then used only for **refreshing** the repos you already track and
  for **per-user** data after OAuth.

This is the single most important architectural decision in the project. Everything below
follows from it.

---

## 1. Corrected architecture (layered, not linear)

The proposal's diagram is a straight vertical pipeline. The real shape is three planes that
run on different clocks:

```
                          ┌─────────────────────────────────────┐
   USER (browser)  ──────▶│  Next.js frontend (SSR + client)      │
                          └───────────────┬───────────────────────┘
                                           │  REST/JSON
                          ┌────────────────▼──────────────────────┐
   SERVING PLANE          │  NestJS API  (reads precomputed data)  │
   (sync, ms latency)     │  auth · profiles · recommend · search  │
                          └───────┬──────────────────┬─────────────┘
                                  │                  │
                          ┌───────▼──────┐    ┌──────▼───────┐
                          │  PostgreSQL  │    │    Redis     │
                          │ (source of   │    │ cache +      │
                          │  truth)      │    │ BullMQ queue │
                          └───────▲──────┘    └──────┬───────┘
                                  │                  │ jobs
   PROCESSING PLANE       ┌───────┴──────────────────▼─────────────┐
   (async, batch)         │  Workers (BullMQ)                       │
                          │   • ingestion   • health scoring        │
                          │   • issue difficulty   • recommendation │
                          │            precompute                   │
                          └───────┬──────────────────┬─────────────┘
                                  │                  │
                          ┌───────▼──────┐    ┌──────▼───────────────┐
   DATA SOURCES           │ GitHub REST/ │    │ GH Archive / BigQuery│
                          │ GraphQL API  │    │ (bulk seed + labels) │
                          └──────────────┘    └──────────────────────┘
                                                       │
                          ┌────────────────────────────▼────────────┐
   ML PLANE (optional)    │  Python FastAPI service                  │
                          │  difficulty / success-prediction models  │
                          └──────────────────────────────────────────┘
```

**Why a separate Python ML service?** The research contributions (difficulty estimation,
success prediction) want scikit-learn / pandas / maybe a transformer for issue text. Doing
that in Node is painful. Keep the app in TypeScript and expose ML as a small internal HTTP
service the workers call. Clean seam, and it's a natural "system contribution" chapter in
the thesis.

---

## 2. Tech stack — decisions (not options)

The proposal lists choices ("Spring Boot **or** NestJS"). Here are the picks for a solo
build, with the reasoning so you can override if your strengths differ.

| Layer | Decision | Why |
|-------|----------|-----|
| **Frontend** | Next.js + TypeScript + Tailwind + **shadcn/ui** | As proposed; shadcn gives you accessible components fast so UI isn't the time sink. |
| **Backend** | **NestJS** (TypeScript) | One language across the whole app = less context-switching solo. Native BullMQ + Prisma fit. **Pick Spring Boot only if Java is clearly your strongest language** — your proposal's examples are Java-heavy, so this is a real fork; decide deliberately. |
| **ORM** | **Prisma** | Type-safe, great migrations, fast to model the schema below. (TypeORM if you go Spring-free but want decorators.) |
| **DB** | PostgreSQL 16 | As proposed. Use `pg_trgm` + GIN indexes for text/skill search; consider `pgvector` if you embed issue text. |
| **Cache + Queue** | Redis + **BullMQ** | As proposed. BullMQ's rate-limiter is exactly how you respect GitHub's 5k/hr. |
| **ML service** | **Python + FastAPI + scikit-learn** | Research models live here. Optional until Phase 5. |
| **Bulk data** | **BigQuery (GH Archive)** | Seed corpus + labeled training data without API quota. |
| **Auth** | GitHub OAuth (NextAuth on the frontend, JWT to the API) | OAuth also raises your per-user API quota and gives the user's languages/repos for free. |
| **Dev infra** | **Docker Compose** (Postgres + Redis + api + web + worker) | One `docker compose up`. |
| **Deploy (demo)** | Single VM or Railway/Render/Fly.io | See §8 — **do not** build the full K8s/AWS/Prometheus stack; it's scope you won't defend. |

> **Scope cut, stated plainly:** Kubernetes, AWS, Prometheus, Grafana, RabbitMQ are listed
> in the proposal but are *operational* concerns, not research or even MVP concerns. Mention
> them as "production deployment path" in the thesis; don't build them. BullMQ replaces
> RabbitMQ. Docker Compose replaces K8s for a demo.

---

## 3. Data model (core tables)

Source of truth in PostgreSQL. Computed scores are columns/JSON on the entity plus an
append-only metrics table for trends.

```
users
  id, github_id, login, avatar_url, email, access_token (encrypted),
  experience_level (enum), created_at

user_skills
  user_id, skill_id, source (enum: self_reported | inferred_from_repos), weight

skills                          -- controlled taxonomy (see §4)
  id, name, type (language|framework|tool|domain), aliases[]

repositories
  id, github_id, full_name, description, primary_language,
  stars, forks, watchers, open_issues_count, contributors_count,
  pushed_at, created_at, archived,
  health_score (0-100), health_rating (enum), health_breakdown (jsonb),
  last_ingested_at, last_scored_at

repository_languages            -- from GitHub languages endpoint
  repository_id, language, bytes

repository_topics               -- GitHub topics → mapped to skills
  repository_id, topic

issues
  id, github_id, repository_id, number, title, body,
  state, labels[], comments_count, created_at, closed_at,
  closed_by_is_first_time_contributor (bool, nullable),  -- research label
  resolution_hours (nullable),                            -- research label
  difficulty_level (enum), difficulty_score, estimated_time_bucket,
  difficulty_features (jsonb), last_scored_at

maintainers
  id, repository_id, github_login,
  median_issue_response_hours, median_pr_review_hours,
  merge_rate, friendliness_score, last_active_at

repository_metrics              -- append-only time series for trends/health
  repository_id, captured_at,
  stars, forks, open_issues, commit_count_30d, release_count_90d

recommendations                 -- precomputed per user, refreshed on a schedule
  user_id, repository_id, issue_id (nullable),
  skill_match_score, composite_score, score_breakdown (jsonb),
  generated_at
```

Key indexes: `issues(repository_id, state)`, `repositories(health_score desc)`,
`recommendations(user_id, composite_score desc)`, GIN on `repository_topics` and skill
arrays.

---

## 4. The skill taxonomy (small but load-bearing)

Skill matching is only as good as the vocabulary. Build a normalized `skills` table with
**aliases** ("js" → "JavaScript", "k8s" → "Kubernetes", "reactjs" → "React"). Sources:

- GitHub `languages` endpoint (authoritative for languages, with byte counts → weights).
- GitHub `topics` (maps to frameworks/domains via your alias table).
- Heuristics on manifest files (`package.json`, `pom.xml`, `requirements.txt`, `go.mod`)
  during ingestion → framework/tool detection.

This taxonomy is shared by user profiling, skill matching, search, and learning paths. Build
it once, early.

---

## 5. The three scoring engines (your research core)

Design each as **v1 heuristic → v2 learned**, so you always have a working system and a
research delta to evaluate against.

### 5a. Repository Health (Module 3)
A transparent weighted composite — easy to defend, easy to ship:
```
health = w1·activity + w2·maintainer + w3·community + w4·documentation
```
- **activity**: recency of commits/releases (decay function on `pushed_at`, 30/90-day counts).
- **maintainer**: median issue response + PR review time (from `maintainers`).
- **community**: contributors, PR frequency, bus-factor proxy.
- **documentation**: presence/quality of README, CONTRIBUTING, CODE_OF_CONDUCT, setup steps.

Research angle: validate the weights and the score's *predictive validity* (does a high
health score correlate with a repo staying active 6 months later? — testable against GH
Archive history).

### 5b. Issue Difficulty (Module 4) — strongest research candidate
Features: title/body length & readability, code-block count, label set, # files referenced,
linked PRs, comment count, age, repo's historical issue patterns.

- **v1 heuristic**: rule/weighted score → {Beginner, Easy, Medium, Advanced}.
- **v2 learned**: train a classifier/regressor using **proxy labels** mined from history —
  e.g. `resolution_hours`, whether a first-time contributor closed it, # of back-and-forth
  comments. This is the cleanest publishable contribution: *"predicting issue difficulty and
  suitability for newcomers beyond the `good-first-issue` label."*
- Estimated completion time = bucketed regression on the same features.

### 5c. Contribution Success Predictor (Advanced)
P(successful merge | repo health, maintainer activity, issue age, doc quality, user-skill
match). Train on historical PR outcomes. Depends on 5a + 5b existing first.

**Evaluation plan (needed for the thesis):** hold-out split on historical data; report
accuracy/F1/MAE; compare against the naive `good-first-issue` baseline. *Decide your ground
truth and evaluation metric in Phase 0 — it dictates what you log during ingestion.*

---

## 6. Recommendation engine (Module 6)

Precomputed, not live. A worker periodically, per active user:
```
composite = w1·skill_match + w2·health + w3·issue_fit + w4·maintainer
          + w5·popularity + w6·interest_match
```
Store top-N in `recommendations`. The API just reads and returns them. Start with fixed
weights; a later research extension is learning the weights from user feedback
(click/contribute signals) — but only if you have users. Don't promise collaborative
filtering you can't evaluate.

---

## 7. Build phases & sequencing

Dependencies matter more than the wishlist order. Nothing scores until data is ingested;
nothing recommends until scoring exists.

| Phase | Goal | Modules | Depends on |
|-------|------|---------|-----------|
| **0. Foundations** | Repo, Docker Compose (pg+redis), NestJS + Next.js skeletons, GitHub OAuth, CI (GitHub Actions), **define eval metrics & ground truth** | — | — |
| **1. Data backbone** | Schema (Prisma), skill taxonomy, **ingestion workers** (REST/GraphQL + BullMQ rate-limiting), BigQuery seed job | M2, M4(taxonomy) | 0 |
| **2. Scoring core** | Health analyzer v1, Issue difficulty v1 (heuristic), metrics time-series | M3, M4 | 1 |
| **3. Matching + recs** | Skill matching, recommendation precompute, basic profile API | M1, M5, M6 | 2 |
| **4. Frontend MVP** | Profile UI, recommendation feed, repo/issue detail, advanced search | M1, M10 | 3 |
| **5. Research models** | Difficulty v2 (ML), success predictor, **evaluation & results** | Adv. features | 2,3,4 |
| **6. Thesis polish** | Trending, learning paths, comparison, write-up | M7,M8 + Adv. | 5 |

**Explicitly deferred / optional** (build only if time remains; they're not thesis-critical):
Notification system (M9), Resume builder, Portfolio integration. Keep them in the proposal
as "future work."

---

## 8. Realistic timeline (solo, part-time, ~9 months)

| Months | Phase | Milestone |
|--------|-------|-----------|
| 1 | 0 | Skeleton boots end-to-end; OAuth login works; eval plan written |
| 2–3 | 1 | 10k+ repos & their issues ingested and refreshing within rate limits |
| 4 | 2 | Every ingested repo has a health score; issues have v1 difficulty |
| 5 | 3 | Logged-in user gets ranked recommendations from precomputed data |
| 6 | 4 | Usable web app: profile → recommendations → repo/issue detail → search |
| 7–8 | 5 | ML difficulty model + success predictor trained and **evaluated vs baseline** |
| 9 | 6 | Trending/learning-path/comparison, thesis write-up, paper draft |

The research contribution (Phase 5) needs Phases 1–2's data and labels to exist first — which
is exactly why "define ground truth in Phase 0" is on the list. The most common failure mode
is reaching month 7 and discovering you never logged the label you need to evaluate against.

---

## 9. Top risks & mitigations

1. **API rate limits** → ingest offline + cache + GH Archive seeding (the whole §0 design).
2. **Over-scope** → MVP = Phases 0–4; everything else is gated on time. Cut M9/resume/portfolio.
3. **No ground truth for ML** → decide proxy labels & metrics in Phase 0; mine from history.
4. **Skill-matching quality hinges on the taxonomy** → invest in aliases early (§4).
5. **Cold-start recommendations** (no user feedback yet) → fixed weights v1; learned weights
   only as an extension, only with real usage.
6. **Deployment rabbit-hole** → Docker Compose + one PaaS; K8s/AWS stays as "future work."

---

## 10. Immediate next steps (Phase 0)

1. Confirm backend language: **NestJS** (recommended) vs Spring Boot.
2. Scaffold the monorepo: `apps/web` (Next.js), `apps/api` (NestJS), `apps/worker`,
   `services/ml` (FastAPI, stub), `packages/db` (Prisma schema), `docker-compose.yml`.
3. Register a GitHub OAuth app; wire login.
4. Write the **evaluation plan** (ground truth + metrics) into `docs/RESEARCH.md`.
5. Draft the Prisma schema from §3.
