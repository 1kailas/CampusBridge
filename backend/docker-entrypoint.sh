#!/bin/sh
set -eu

# Ensure the persistent SQLite directory exists and is writable.
mkdir -p /app/data

echo "Applying database schema..."
npx prisma db push --skip-generate

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "Seeding the demo catalogue..."
  node dist/prisma/seed.js
fi

echo "Starting Campus Bridge API..."
exec "$@"
