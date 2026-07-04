# OpenPath — Research & Evaluation Plan

> Write this **before** ingestion (Phase 0). The biggest risk in the project is
> reaching the modeling phase and discovering you never logged the label you need.
> This document pins down the research question, ground truth, datasets, and
> metrics so the data backbone (Phase 1) captures everything required.

---

## 1. Primary research question

> **Can we predict the *difficulty* and *newcomer-suitability* of a GitHub issue
> more accurately than the existing `good-first-issue` / `help-wanted` labels?**

This is the strongest publishable contribution because:
- The baseline (label-based) is trivial and widely used → a clear bar to beat.
- Labels are noisy, sparse, and applied inconsistently → real headroom.
- Ground truth can be mined from public history → no manual annotation needed.

Secondary questions (build only after the primary is evaluated):
- **RQ2 — Health:** Does the repository health score (§5a of the plan) predict a
  repo *remaining active* 6 months later?
- **RQ3 — Success:** Can we predict P(a contribution attempt is merged) from
  repo health + issue difficulty + maintainer responsiveness + skill match?

---

## 2. Ground truth (proxy labels)

There is no human "difficulty" label, so we mine proxies from issue/PR history.
**These columns already exist in the schema** (`Issue.resolutionHours`,
`Issue.closedByFirstTimeContributor`) — populate them during ingestion.

| Proxy label | Definition | Used for |
|-------------|------------|----------|
| `resolutionHours` | hours from issue open → close (closed issues only) | difficulty regression target |
| `commentsCount` | back-and-forth before resolution | difficulty signal/target |
| `closedByFirstTimeContributor` | closing PR's author had 0 prior merged PRs in this repo | newcomer-suitability label |
| participant count | distinct users who commented | difficulty signal |

**Difficulty class derivation (v1):** bucket `resolutionHours` (and/or comment
count) into {Beginner, Easy, Medium, Advanced} using quantiles computed *per
repository* (normalizes for repo pace). Document the exact thresholds when set.

> Caveat to discuss in the thesis: resolution time is a *proxy*, confounded by
> maintainer availability and issue staleness. Mitigate by also reporting the
> newcomer-suitability label (a more direct signal) and by per-repo normalization.

---

## 3. Datasets

| Source | Use | Why |
|--------|-----|-----|
| **GH Archive → BigQuery** | bulk historical issues + PR-close events to build the labeled training set | free, no API quota, millions of events |
| **GitHub REST/GraphQL** | refresh tracked repos; fetch full issue bodies for features | authoritative, current |
| **GHTorrent** (optional/archived) | cross-check | historical relational dumps |

**Sampling frame:** pick a defensible scope, e.g. the top *N* repos by stars
across ~6 primary languages (Java, Python, JS/TS, Go, Rust, C++), restricted to
non-archived repos with ≥ X closed issues. State N, X, and the snapshot date in
the thesis — reproducibility matters for the paper.

**Split:** temporal split (train on issues closed before date D, test after D) to
avoid leakage and mimic real deployment. Also report a random split for comparison.

---

## 4. Features (issue difficulty model — §5b)

Derived at ingestion and stored in `Issue.difficultyFeatures` (JSON):

- text: title length, body length, readability, # code blocks, # checklists, has
  stack trace, # external links
- metadata: label set (one-hot), # labels, age, comment count at scoring time
- repo context: repo primary language, repo health score, repo median resolution
  time, # open issues
- (v2) text embeddings of title+body (e.g. sentence-transformers) → the "beyond
  labels" semantic signal

---

## 5. Models

- **v1 — heuristic baseline (ours):** transparent weighted score → difficulty class.
- **Baseline to beat:** `good-first-issue` label as a binary difficulty predictor.
- **v2 — learned:** gradient-boosted trees (XGBoost/LightGBM) on the features
  above; optionally a text model on embeddings. Compare against both baselines.

---

## 6. Evaluation metrics

| Task | Metrics |
|------|---------|
| Difficulty classification | Accuracy, macro-F1, confusion matrix, Cohen's κ vs proxy labels |
| Newcomer-suitability (binary) | Precision, Recall, F1, ROC-AUC, PR-AUC |
| Completion-time regression | MAE, RMSE, R² (on log-hours) |
| Recommendation quality (RQ3, if usage data exists) | Precision@k, NDCG@k, MRR |
| Health predictive validity (RQ2) | AUC predicting "active in 6 months" |

**Headline comparison:** ours (v2) vs `good-first-issue` baseline vs v1 heuristic,
on the temporal test split, with significance testing where applicable.

---

## 7. Threats to validity (pre-empt for the thesis)

- **Label noise** — proxy labels ≠ true difficulty (see §2 caveat).
- **Selection bias** — only *closed* issues have labels; open issues we score may
  differ systematically. Discuss and, if possible, report calibration on a held-out
  later window once those issues close.
- **Survivorship** — popular repos over-represented; state the sampling frame.
- **Temporal drift** — GitHub norms change; temporal split addresses this.

---

## 8. What this means for Phase 1 (ingestion) — action items

1. When ingesting a closed issue, compute and store `resolutionHours`.
2. When ingesting the closing PR, determine `closedByFirstTimeContributor` (needs
   the author's prior merged-PR count in that repo) and store it.
3. Store the raw feature inputs in `difficultyFeatures` so models can be retrained
   without re-fetching.
4. Record the **snapshot date** and **sampling-frame parameters** (N, X, languages)
   somewhere queryable — they go in the paper's reproducibility section.
