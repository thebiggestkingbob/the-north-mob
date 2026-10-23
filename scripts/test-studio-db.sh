#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Local-only, network-isolated disposable database. No real records or credentials.
export DOCKER_HOST=unix:///var/run/docker.sock
unset DOCKER_CONTEXT DOCKER_TLS DOCKER_TLS_VERIFY DOCKER_CERT_PATH
studio_db="north-mob-studio-test-$$"
trap 'docker rm -f "$studio_db" >/dev/null 2>&1 || true' EXIT
docker run -d --name "$studio_db" --network none -e POSTGRES_PASSWORD=local-test-only postgres:17-alpine >/dev/null
for attempt in $(seq 1 30); do
 if docker exec "$studio_db" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then break; fi
 sleep 1
done
for file in supabase/tests/bootstrap.sql supabase/migrations/*_studio_owner_events.sql supabase/seed.sql supabase/tests/events.sql; do
 docker exec -i -e PGPASSWORD=local-test-only "$studio_db" psql -h 127.0.0.1 -X -v ON_ERROR_STOP=1 -U postgres < "$file"
done
