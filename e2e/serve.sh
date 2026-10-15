#!/bin/sh
# Builds and serves the site against the fake Resend, for E2E_REUSE=1 runs.
# Ctrl-C stops both servers.
set -e
export E2E_RESEND_PORT="${E2E_RESEND_PORT:-3201}"
node e2e/fake-resend.mjs &
FAKE=$!
trap 'kill $FAKE 2>/dev/null' EXIT INT TERM
RESEND_BASE_URL="http://localhost:$E2E_RESEND_PORT" RESEND_API_KEY=re_fake_e2e TZ=America/New_York \
  sh -c 'npm run build && exec npx next start -p "${E2E_PORT:-3100}"'
