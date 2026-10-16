#!/bin/sh
# Runs Playwright inside the pinned Linux image that CI uses.
#
# By default it runs on the host's native platform (linux/arm64 on Apple
# Silicon): fast, and good for debugging Linux-only failures. Screenshots
# rendered there don't match CI's amd64 baselines, so visual tests are left out.
#
# E2E_AMD64=1 runs as linux/amd64 to match CI exactly, visual tests included.
# On a non-amd64 host that is emulated: slow, with longer timeouts
# (E2E_EMULATED), and Chromium can crash. Baselines normally come from CI.
#
# node_modules and .next live in named volumes per platform: the macOS builds of
# native packages (@tailwindcss/oxide, lightningcss, pagefind) don't run on Linux.
set -e
HOST_ARCH=$(uname -m | sed 's/x86_64/amd64/; s/aarch64/arm64/')
ARCH=${E2E_AMD64:+amd64}
ARCH=${ARCH:-$HOST_ARCH}
[ "$ARCH" = amd64 ] && DOCKER=1 || DOCKER=
[ "$ARCH" != "$HOST_ARCH" ] && EMULATED=1 || EMULATED=
exec docker run --rm --ipc=host --platform "linux/$ARCH" \
  -v "$PWD":/work \
  -v "codenotes-e2e-$(basename "$PWD")-$ARCH-nm":/work/node_modules \
  -v "codenotes-e2e-$(basename "$PWD")-$ARCH-next":/work/.next \
  -w /work \
  ${DOCKER:+-e E2E_DOCKER=1} \
  ${EMULATED:+-e E2E_EMULATED=1} \
  mcr.microsoft.com/playwright:v1.64.0-noble \
  sh -c '[ node_modules/.package-lock.json -nt package-lock.json ] || npm ci; npx playwright test "$@"' -- "$@"
