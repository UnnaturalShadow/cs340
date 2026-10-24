#!/usr/bin/env bash
set -euo pipefail
# Keep dependency extraction on WSL's Linux filesystem.
project_root="$PWD"
mkdir -p tmp
verification_root=$(mktemp -d /tmp/tweeter-milestone2.XXXXXX)
printf '%s\n' "$verification_root" > tmp/wsl-verification-path.txt
tar --exclude=node_modules --exclude=dist --exclude=.env --exclude='.env.*' \
  -cf - package.json package-lock.json tweeter-web tweeter-shared | tar -xf - -C "$verification_root"
cd "$verification_root"
npm ci --ignore-scripts --no-audit --no-fund
npm run compile --workspace tweeter-shared
npm test --workspace tweeter-web -- --runInBand --silent
npm run test:mvp --workspace tweeter-web
npm run build --workspace tweeter-web
printf 'Verified WSL source copy: %s\n' "$verification_root"
