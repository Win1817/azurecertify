#!/bin/sh
set -e

echo "[entrypoint] Running database schema push..."
cd /app/lib/db

# Find drizzle-kit bin from pnpm virtual store
DRIZZLE_BIN=$(find /app/node_modules/.pnpm -path "*/drizzle-kit/bin/drizzle-kit*" ! -name "*.map" ! -name "*.d.ts" -type f 2>/dev/null | head -1)

if [ -z "$DRIZZLE_BIN" ]; then
  echo "[entrypoint] WARNING: drizzle-kit binary not found, skipping schema push"
else
  echo "[entrypoint] Using: $DRIZZLE_BIN"
  node "$DRIZZLE_BIN" push --config ./drizzle.config.cjs --force
  echo "[entrypoint] Schema push complete."
fi

cd /app
exec "$@"
