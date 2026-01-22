#!/usr/bin/env bash
set -euo pipefail

# Deploys the dashboard to a remote server via rsync.
# Required env vars:
#   DASHBOARD_SSH_HOST (e.g. 203.0.113.10 or dashboard.example.com)
#   DASHBOARD_SSH_USER (e.g. ubuntu)
#   DASHBOARD_SSH_PATH (e.g. /var/www/shunyalabs-dashboard)
# Optional:
#   DASHBOARD_SSH_PORT (default: 22)

HOST="${DASHBOARD_SSH_HOST:-}"
USER="${DASHBOARD_SSH_USER:-}"
REMOTE_PATH="${DASHBOARD_SSH_PATH:-}"
PORT="${DASHBOARD_SSH_PORT:-22}"

if [[ -z "$HOST" || -z "$USER" || -z "$REMOTE_PATH" ]]; then
  echo "Missing required env vars."
  echo "Set: DASHBOARD_SSH_HOST, DASHBOARD_SSH_USER, DASHBOARD_SSH_PATH"
  exit 1
fi

echo "Generating dashboard..."
npm run dashboard >/dev/null

echo "Deploying to ${USER}@${HOST}:${REMOTE_PATH} ..."
rsync -av --delete -e "ssh -p ${PORT}" dashboard/ "${USER}@${HOST}:${REMOTE_PATH}/"

echo "✅ Deploy complete."
