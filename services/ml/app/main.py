"""OpenPath ML service (stub).

Phase 0 placeholder. In Phase 5 this exposes the trained issue-difficulty and
contribution-success models (TECHNICAL_PLAN.md §5b, §5c). The NestJS workers call
these endpoints during scoring; the app itself stays in TypeScript.
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="OpenPath ML Service", version="0.1.0")


class IssueFeatures(BaseModel):
    title: str
    body_length: int
    label_count: int
    code_block_count: int = 0
    comments_count: int = 0


class DifficultyPrediction(BaseModel):
    difficulty_level: str
    difficulty_score: float
    model_version: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "openpath-ml"}


@app.post("/predict/difficulty", response_model=DifficultyPrediction)
def predict_difficulty(features: IssueFeatures) -> DifficultyPrediction:
    # TODO (Phase 5): replace this heuristic with the trained model.
    score = min(1.0, (features.body_length / 2000) + 0.1 * features.label_count)
    if score < 0.25:
        level = "BEGINNER"
    elif score < 0.5:
        level = "EASY"
    elif score < 0.75:
        level = "MEDIUM"
    else:
        level = "ADVANCED"
    return DifficultyPrediction(
        difficulty_level=level,
        difficulty_score=round(score, 3),
        model_version="stub-0",
    )
