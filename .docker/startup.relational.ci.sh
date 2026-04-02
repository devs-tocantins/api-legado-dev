#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432
npm run migration:run
npm run seed:run:relational
npm run start:prod > prod.log 2>&1 &
/opt/wait-for-it.sh maildev:1080
if ! /opt/wait-for-it.sh -t 60 localhost:3000; then
  echo "=== prod.log ==="
  cat prod.log
  exit 1
fi
npm run lint
npm run test:e2e -- --runInBand
