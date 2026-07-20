#!/usr/bin/env bash
# Vahntra fast deploy: stage + commit + push to first-push + publish to main.
# Usage: ./deploy.sh "commit message"
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./deploy.sh \"commit message\""
  exit 1
fi

cd "$(dirname "$0")"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "first-push" ]; then
  echo "Not on first-push (currently on $BRANCH) — switching."
  git checkout first-push
fi

git add -A

if git diff --cached --quiet; then
  echo "Nothing staged — checking if first-push is already ahead of main..."
else
  git commit -m "$1"
fi

git push origin first-push
git push origin first-push:main

echo ""
echo "Pushed to main. Vercel auto-deploys in ~1 minute."
echo "Verify with: npx vercel project ls --scope rahmancodetests-4423s-projects"
