#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh "${DATABASE_HOST:-postgres}:${DATABASE_PORT:-5432}"
npm run migration:run:prod
npm run seed:run:relational:prod
npm run start:prod
