#!/bin/sh
set -e

echo "[entrypoint] Running database schema push..."
cd /app/lib/db

# drizzle-kit is a devDep, find it from the build-copied node_modules
DRIZZLE_KIT=$(find /app/node_modules -name "drizzle-kit" -type f | grep "bin/drizzle-kit.cjs" | head -1)

if [ -z "$DRIZZLE_KIT" ]; then
  # fallback: try direct path
  DRIZZLE_KIT="/app/node_modules/drizzle-kit/bin/drizzle-kit.cjs"
fi

node "$DRIZZLE_KIT" push --config ./drizzle.config.cjs --force
echo "[entrypoint] Schema push complete."

cd /app
exec "$@"
