#!/usr/bin/env bash
set -e

echo "Waiting for Postgres..."
python - <<'PY'
import os, time, sys
import psycopg2
url = os.environ["DATABASE_URL"]
for i in range(60):
    try:
        psycopg2.connect(url).close()
        print("Postgres is ready.")
        sys.exit(0)
    except Exception as e:
        print(f"  ...not ready ({e}); retrying")
        time.sleep(1)
print("Postgres did not become ready in time", file=sys.stderr)
sys.exit(1)
PY

echo "Running migrations..."
alembic upgrade head

echo "Seeding database (idempotent)..."
python -m app.seed

echo "Starting API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" ${UVICORN_RELOAD:+--reload}
