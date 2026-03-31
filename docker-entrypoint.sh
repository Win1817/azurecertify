#!/bin/sh
set -e

echo "[entrypoint] Running database schema push..."
cd /app/lib/db

# Find drizzle-kit entry point dynamically
DRIZZLE_BIN=$(find /app/node_modules/.pnpm -path "*/drizzle-kit*/bin/drizzle-kit.cjs" 2>/dev/null | head -1)

if [ -z "$DRIZZLE_BIN" ]; then
  DRIZZLE_BIN=$(find /app/node_modules -path "*/drizzle-kit/bin/drizzle-kit.cjs" 2>/dev/null | head -1)
fi

if [ -z "$DRIZZLE_BIN" ]; then
  echo "[entrypoint] WARNING: drizzle-kit not found, skipping schema push"
else
  echo "[entrypoint] Using drizzle-kit at: $DRIZZLE_BIN"
  node "$DRIZZLE_BIN" push --config ./drizzle.config.cjs --force
  echo "[entrypoint] Schema push complete."
fi

cd /app
exec "$@"
