#!/usr/bin/env sh
set -eu

export DB_HOST=127.0.0.1
export DB_PORT=55432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_DATABASE=postgres
export DB_POOL_MAX=1
export QUEUE_DRIVER=sync

node ace test functional --files tests/functional/queue/jobs_dispatch.spec.ts --files tests/functional/queue/jobs_execution.spec.ts
