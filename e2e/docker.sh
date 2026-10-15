#!/bin/sh
# Runs Playwright inside the pinned Linux image so visual baselines match CI.
# node_modules and .next live in named volumes: the macOS builds of native
# packages (@tailwindcss/oxide, lightningcss, pagefind) don't run on Linux.
set -e
exec docker run --rm --ipc=host --platform linux/amd64 \
  -v "$PWD":/work \
  -v "codenotes-e2e-$(basename "$PWD")-amd64-nm":/work/node_modules \
  -v "codenotes-e2e-$(basename "$PWD")-amd64-next":/work/.next \
  -w /work \
  -e E2E_DOCKER=1 \
  -e E2E_EMULATED=1 \
  mcr.microsoft.com/playwright:v1.64.0-noble \
  sh -c '[ node_modules/.package-lock.json -nt package-lock.json ] || npm ci; npx playwright test "$@"' -- "$@"
