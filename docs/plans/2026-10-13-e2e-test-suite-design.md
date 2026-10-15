# E2E Test Suite: Design

**Date:** 2026-10-13 · **Status:** awaiting approval · **Scope:** `docs/test-plan.md` (§0–§8)

## Goal

A Playwright suite that catches behavioural and visual regressions on the portfolio across Chromium, Firefox, and WebKit, runs deterministically with no external network access, and is green on `main` in CI. Every test has been seen to fail against a deliberately broken site before it is accepted.

## Decisions

| # | Decision | Choice |
| --- | --- | --- |
| 1 | Runner | Playwright (already installed); `@axe-core/playwright` for a11y |
| 2 | Contact backend | Local fake Resend server, reached through the SDK's `RESEND_BASE_URL`. No changes to product code. |
| 3 | Fixture data | Derived when tests run from `src/content/**/_meta.js` and MDX front matter. Edge cases with no real content to test are skipped and reported. |
| 4 | Visual baselines | Generated in the official Playwright Docker image; committed next to the specs |
| 5 | Screenshot set | Full-page shots at phone (390×844) and desktop (1280×800); component shots at all 4 screen sizes |
| 6 | CI | GitHub Actions, one job per browser, with minute guardrails |
| 7 | Real bugs | Stop, report, and wait for approval. Then fix in a separate `fix:` commit on the branch; the test stays strict. |

## Architecture

### Server under test: a production build, not `next dev`

The main suite runs against `next build && next start` on port 3100:

- Search (Pagefind) only works after a build.
- `next dev` puts a dev-tools badge on the page, which would appear in every screenshot.
- Hydration and timing match production.

Locally the server is reused if it's already running (`reuseExistingServer`), so repeat runs skip the build.

`webServer` starts two processes:

1. **Fake Resend:** `node e2e/fake-resend.mjs` on port 3201.
2. **The site:**
   - Started with `RESEND_BASE_URL=http://localhost:3201` and `RESEND_API_KEY=re_fake_e2e`.
   - Variables already set in the environment take precedence over `.env.local`, so the real key is never loaded.
   - `route.ts` creates its Resend client on each request, so these runtime variables are enough.

### Fake Resend (`e2e/fake-resend.mjs`, ~40 lines)

| Endpoint | Purpose |
| --- | --- |
| `POST /emails` | What the SDK calls. Records the body and replies with the next queued response (default `200 {id}`). |
| `POST /__next` | A test queues the next response, for example `{status: 422, body: {...}}`. |
| `GET /__sent` | A test reads back what was "sent" (to check the payload and HTML escaping). |
| `POST /__reset` | Clears the queue and the log. Called in `beforeEach`. |

Because the fake keeps shared state, contact API specs run serially (`test.describe.configure({ mode: 'serial' })`).

### Shared fixture (`e2e/fixtures.ts`)

This is the only shared helper; every spec imports `test`/`expect` from it. It extends Playwright's `test` with an automatic fixture that:

- **Blocks external requests.** It aborts every request not addressed to `localhost`, except `images.react-photo-album.com`, which is answered with a 1×1 PNG. Any blocked request fails the test and lists the URL.
- **Fails on page errors.** It collects `pageerror` and `console.error` events and fails the test if there are any.

### Content source (`e2e/content.ts`)

Imports each `_meta.js` and reads front matter with a regex (no new dependency). It exports:

- `routes`: every routable page
- `visibleProjects` / `hiddenProjects`
- `posts`, sorted by `date`

### Configuration (`playwright.config.ts`)

- **Browser projects:** `chromium`, `firefox`, `webkit`, each at the desktop size. Phone and other sizes are set inside specs with `test.use({ viewport })`, so phone tests run on all 3 engines. The Pixel device profile is Chromium-only and is dropped.
- **Defaults:**
  - `timezoneId: 'America/New_York'` (this exposes the suspected date bug #5)
  - `locale: 'en-US'`
  - `grepInvert: /@external/`
- **Screenshot settings:**
  - `animations: 'disabled'`, `caret: 'hide'`
  - `maxDiffPixelRatio: 0.01`
  - `snapshotPathTemplate` keyed by project (browser)
- **Separate config:** `playwright.external.config.ts` runs `@external` against the live site, with no server and no request blocking.

### Tags

Every `test()` gets `{ tag: '@functional' | '@visual' | '@a11y' }`. Link checks are `@external`.

## File layout

```
e2e/
  fixtures.ts               shared test (network guard, error collection)
  content.ts                routes/projects/posts from src/content
  fake-resend.mjs           fake Resend API
  functional/
    routing.spec.ts         plan §3.1
    navigation.spec.ts      §3.2
    home.spec.ts            §3.3
    contact-form.spec.ts    §3.4  (page.route mocks /api/contact)
    contact-api.spec.ts     §3.5  (request.post → real route → fake Resend)
    search.spec.ts          §3.6
  ui/
    visual.spec.ts          §4.1
    responsive.spec.ts      §4.2
    theme.spec.ts           §4.3
    a11y.spec.ts            §4.4
  external/
    links.spec.ts           §5
playwright.config.ts
playwright.external.config.ts
.github/workflows/e2e.yml
.github/workflows/links.yml
```

The current `e2e/navigation.spec.ts` and `e2e/ui.spec.ts` will be absorbed into these files and deleted.

### Scripts

| Script | Runs |
| --- | --- |
| `test:e2e` | The default suite on the host machine, for fast iteration. The config adds `@visual` to `grepInvert` unless `E2E_DOCKER=1` is set, because the baselines are Linux-only. |
| `test:e2e:functional` / `:a11y` / `:visual` | One tag each (`--grep`) |
| `test:e2e:docker` | Full suite inside `mcr.microsoft.com/playwright:v1.64.0-noble` |
| `test:e2e:update` | Updates the baselines inside Docker |
| `test:e2e:links` | The external link suite |

**Docker note:** the repo is mounted into the container, but `node_modules` is a **named volume** with its own `npm ci`. macOS native binaries (`@tailwindcss/oxide`, `lightningcss`, `pagefind`) don't run on Linux.

## CI (`.github/workflows/e2e.yml`)

- **Triggers:** pull requests and pushes to `main`. `paths-ignore` skips `docs/**`, `**/*.md`, and `.impeccable/**`.
- **Matrix:** `[chromium, firefox, webkit]`, running in the same Playwright container image as the baselines.
- **Steps:** `npm ci` → `npx playwright test --project=$browser`.
- **Limits:**
  - `concurrency: e2e-${{ github.ref }}` with `cancel-in-progress: true`
  - `timeout-minutes: 20` per job
- **On failure:** uploads `playwright-report/` and `test-results/`.
- **Links:** `links.yml` runs weekly on a schedule (and can be started by hand) with `timeout-minutes: 10`.
- **Cost:** the repo is public, so standard runners are free. If it goes private, the account's Actions spending limit (default $0) is the hard cap. Keep it at $0.

## Test method (from the brief)

For each test:

1. Write the test.
2. Break the behaviour it covers.
3. Show the failure.
4. Revert the break, show the test passing, then run it 3 times (`--repeat-each=3`).

Deliberate breaks are never committed.

If a test fails against the unbroken site, I stop, run systematic debugging, and report it (decision 7).

## Known risks

- **WebGL in Firefox/WebKit headless:** `ParticleSphere` creates `WebGLRenderer` without a guard. If the hero throws there, that's a real bug (report and fix), not a reason to skip.
- **Theme dropdown:** Nextra's "Change theme" control is a Headless UI listbox. Tests locate it by its accessible name, not its markup.
- **Content-derived lists:** pages hidden from the sidebar (`securechatapp`, `raspberrypi`, `riftrewind`, `/gallery/test`) are treated as *reachable by URL but absent from navigation*, which is what the comments in `_meta.js` say is intended.

## Plan changes this design makes

These go into `docs/test-plan.md` in the first commit:

- **§1 corrections:**
  - The gallery route is `/gallery/test`; `/gallery` returns 404.
  - The Pagefind index is committed in `public/_pagefind`.
  - There is one blog post.
  - The theme control is a "Change theme" listbox.
- **§3.3 additions:**
  - Marquee pauses on hover and focus.
  - The hero works when WebGL is unavailable.
- **§3.5 addition:** Resend returns `{ error }` and the route ignores it, so a failed send returns 200. This is §7 bug #6.
- **§2 addition:** the gallery's external images are stubbed.
- **§4.2 reduction:** full-page screenshots only at phone and desktop sizes.

## Out of scope / later

- **Real Resend smoke test:** one `@external` test sending to `delivered@resend.dev`. It needs the recipient made configurable in `route.ts` and a send-only API key stored as a CI secret. Nothing in this design blocks it.
- Unit tests, performance budgets, testing the deployed site.
