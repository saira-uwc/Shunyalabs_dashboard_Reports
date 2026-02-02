#!/usr/bin/env bash
set -euo pipefail

TEST_EXIT=0
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"
npx playwright test || TEST_EXIT=$?

node scripts/update-coverage-sheet.js || true
node dashboard/generate-dashboard.js
bash scripts/publish-dashboard.sh

exit "$TEST_EXIT"
