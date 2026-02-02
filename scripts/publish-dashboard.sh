#!/usr/bin/env bash
set -euo pipefail

# Publishes the generated dashboard to the current git remote (origin).
# Requires: git remote "origin" pointing to the GitHub Pages repo.

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository. Aborting."
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Git remote 'origin' not found. Set it to your GitHub Pages repo first."
  exit 1
fi

REMOTE_URL="$(git remote get-url origin)"
echo "Publishing to: ${REMOTE_URL}"

git add dashboard/index.html dashboard/history/runs.json
if [[ -d "dashboard/playwright-artifacts" ]]; then
  git add dashboard/playwright-artifacts
fi

if git diff --cached --quiet; then
  echo "No dashboard changes to publish."
  exit 0
fi

COMMIT_MSG="Update dashboard $(date -u +"%Y-%m-%d %H:%M UTC")"
git commit -m "${COMMIT_MSG}"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
git push origin "${BRANCH}"

echo "✅ Dashboard published."
