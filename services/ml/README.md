# OpenPath ML Service

Python/FastAPI service for the research models (issue-difficulty estimation,
contribution-success prediction). Kept separate from the TypeScript app so the
modeling work can use pandas / scikit-learn / transformers.

## Run (dev)

```bash
cd services/ml
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then: http://localhost:8000/health and http://localhost:8000/docs

> Note: Python 3.14 is very new — if `pip install` fails on a future ML dependency
> (numpy/scikit-learn), use a 3.11–3.12 venv for this service. The app stays on
> Node 24 regardless.
