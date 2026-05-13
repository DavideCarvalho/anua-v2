#!/bin/bash
cleanup() {
  echo ""
  echo "🧹 Killing proxies..."
  kill $REDIS_PID $DB_PID 2>/dev/null
  wait $REDIS_PID $DB_PID 2>/dev/null
  echo "✅ Proxies stopped"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "🧹 Killing existing proxies..."
pkill -f "guara proxy" 2>/dev/null
sleep 1

echo "🚀 Starting Redis proxy..."
guara proxy --service anua-redis-34776a --local-port 6379 --project anu &
REDIS_PID=$!

echo "🚀 Starting DB proxy..."
guara proxy --service anua-db-7a642d --local-port 5432 --project anu &
DB_PID=$!

sleep 2
echo ""
echo "📋 Both proxies running. Press Ctrl+C to stop."

wait $REDIS_PID $DB_PID
