#!/usr/bin/env bash
set -e

echo "Waiting for Postgres at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."
python - <<'PY'
import os, time, sys
import psycopg2
host = os.getenv("POSTGRES_HOST", "db")
port = int(os.getenv("POSTGRES_PORT", "5432"))
user = os.getenv("POSTGRES_USER", "wallmeri")
password = os.getenv("POSTGRES_PASSWORD", "wallmeri")
db = os.getenv("POSTGRES_DB", "wallmeri")
for i in range(60):
    try:
        psycopg2.connect(host=host, port=port, user=user, password=password, dbname=db).close()
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
