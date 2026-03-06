#!/usr/bin/env bash
# Replica o pipeline de CI localmente. Rode antes de dar push.
# Requer: PostgreSQL rodando em 127.0.0.1:5432 com DB anua_test

set -e

export NODE_ENV=test
export PORT=3333
export HOST=127.0.0.1
export APP_KEY=0123456789abcdef0123456789abcdef
export LOG_LEVEL=error
export SESSION_DRIVER=cookie
export DB_HOST=127.0.0.1
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_DATABASE=anua_test
export DB_POOL_MAX=5
export SMTP_HOST=localhost
export SMTP_PORT=1025
export SMTP_USER=test
export SMTP_PASSWORD=test
export SMTP_FROM_EMAIL=test@example.com
export DRIVE_DISK=fs
export ASAAS_API_KEY=test
export ASAAS_WEBHOOK_URL=https://example.com/webhook
export ASAAS_WEBHOOK_TOKEN=test
export QUEUE_DRIVER=sync

echo "=== Quality ==="
pnpm run lint
pnpm run typecheck
pnpm exec tsc -p inertia/tsconfig.json --noEmit
pnpm run build

echo ""
echo "=== Tests ==="
pnpm install --frozen-lockfile
npx playwright install --with-deps chromium
node ace migration:fresh --force
pnpm test

echo ""
echo "=== CI local OK ==="
