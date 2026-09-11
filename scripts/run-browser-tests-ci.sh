#!/usr/bin/env bash
set -euo pipefail

PLAYWRIGHT_VERSION="1.55.0"
PORT="4173"
BASE_URL="http://127.0.0.1:${PORT}/"

npm install --no-save --no-package-lock "playwright@${PLAYWRIGHT_VERSION}"
npx playwright install --with-deps chromium

python3 -m http.server "${PORT}" --bind 127.0.0.1 >/tmp/ardua-browser-tests-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "${SERVER_PID}" 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  if curl -fsS "${BASE_URL}" >/dev/null; then
    break
  fi
  sleep .5
done

if ! curl -fsS "${BASE_URL}" >/dev/null; then
  cat /tmp/ardua-browser-tests-http.log || true
  exit 1
fi

export ARDUA_TEST_URL="${BASE_URL}"
node --check scripts/test-phase-goal-hierarchy-browser.mjs
node --check scripts/test-p0-player-experience-browser.mjs
node scripts/test-phase-goal-hierarchy-browser.mjs
node scripts/test-p0-player-experience-browser.mjs
