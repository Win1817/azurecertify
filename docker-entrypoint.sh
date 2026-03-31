#!/bin/sh
set -e

echo "[entrypoint] Running database schema push..."
cd /app/lib/db

node /app/node_modules/.pnpm/drizzle-kit@0.31.9/node_modules/drizzle-kit/bin.cjs push --config ./drizzle.config.cjs --force

echo "[entrypoint] Schema push complete."
cd /app
exec "$@"
