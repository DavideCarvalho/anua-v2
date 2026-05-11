#!/usr/bin/env bash
set -euo pipefail

SERVICE="anua-db-7a642d"
LOCAL_PORT="${1:-5432}"

echo "=== Anua v2 - Database Proxy ==="
echo "Service:  $SERVICE"
echo "Port:     $LOCAL_PORT"
echo ""

if lsof -Pi :"$LOCAL_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "[!] Porta $LOCAL_PORT ja esta em uso. Matando processo..."
  kill "$(lsof -t -i:"$LOCAL_PORT")" 2>/dev/null || true
  sleep 1
fi

echo "[*] Conectando ao banco via guara proxy..."
echo "    (mantenha este terminal aberto)"
echo ""

guara proxy --service "$SERVICE" --local-port "$LOCAL_PORT"
