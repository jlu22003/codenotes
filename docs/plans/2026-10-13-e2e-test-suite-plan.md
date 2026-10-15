# E2E Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task, in a git worktree (superpowers:using-git-worktrees). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Playwright suite that runs on Chromium, Firefox, and WebKit and covers behaviour (`@functional`), appearance (`@visual`), and accessibility (`@a11y`) across the whole portfolio. It runs deterministically against a production build with no external network access. A separate `@external` link checker sits outside the default run.

**Architecture:**
- `playwright.config.ts` starts two servers: a fake Resend API (`e2e/fake-resend.mjs`) and `next build && next start`. The site is pointed at the fake through `RESEND_BASE_URL`.
- Every spec imports `test`/`expect` from `e2e/fixtures.ts`, which blocks external requests and fails a test on page errors.
- Expected data (routes, titles, dates) comes from `src/content` at run time, via `e2e/content.ts`.
- Visual baselines are generated only in the Playwright Docker image.

**Tech Stack:** `@playwright/test` 1.64.0, `@axe-core/playwright` 4.13, Next.js 15 + Nextra 4.6, Node 26 (host), `mcr.microsoft.com/playwright:v1.64.0-noble` (Docker/CI), GitHub Actions.

**Spec:** `docs/plans/2026-10-13-e2e-test-suite-design.md` (design) and `docs/test-plan.md` (brief + scope). Read both before starting any task.

## Global Constraints

- **Tags:** every `test()` has `{ tag: '@functional' | '@visual' | '@a11y' }`; link checks use `@external`.
- **Imports:** every spec imports `test`/`expect` from `e2e/fixtures.ts`, never directly from `@playwright/test`.
- **Network:** no real request leaves `localhost` in the main suite. `images.react-photo-album.com` is stubbed with a 1×1 PNG.
- **Email:** the site under test always runs with `RESEND_BASE_URL=http://localhost:3201` and `RESEND_API_KEY=re_fake_e2e`. Never start the site for tests any other way.
- **Time:** the site server and the browser both run with timezone `America/New_York`; the browser locale is `en-US`.
- **Visual baselines:** generated only by `npm run test:e2e:docker`. Never run `--update-snapshots` on the host.
- **Flakiness:** run every spec file 3 times (`--repeat-each=3`, all three browsers) before a task is done.
- **Minimal code:** no page objects, and no helper unless at least two tests use it. A local function inside one spec file is fine.
- **Selectors:** `getByRole` / `getByLabel` first. CSS only where the plan says so.
- **Waits:** never use `page.waitForTimeout`. Use web-first assertions, `expect.poll`, or frame counting where the plan shows it.
- **Commits:** follow the repo style (`feat:`, `fix:`, `test:`, `ci:`, `docs:`). Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Deliberate breaks** (RED) are never committed. Before every commit, `git diff --stat -- src public` must be empty unless the task is a bug fix approved by the user.

## Working Protocol (applies to every test in every task)

From the brief, "TDD adapted for existing code":

1. **Write** the test.
2. **RED:** apply the task's listed break to product code. Run the test and confirm it **fails for the stated reason**. Paste the failure output into the task report.
3. **GREEN:** revert the break (`git checkout -- <file>`), run again, and confirm it passes.
4. **Never commit** a break.

The site runs as a production build, so every run rebuilds it (about 1–2 minutes). Batch a task's breaks into one RED run where they don't interfere with each other.

**A test that can't be made to fail is testing nothing.** Rewrite it.

**Bug Protocol.** If a test fails against the **unbroken** site:

1. Check it isn't a selector mistake. Open the trace (`npx playwright show-trace`) and confirm the element exists and the assertion is about behaviour. A wrong selector is fixed in the test.
2. If it's real behaviour, **STOP.** Use superpowers:systematic-debugging. Report the root cause and evidence to the user.
3. Wait for approval. Then fix the product code in its own `fix:` commit on this branch. The test is never loosened.
4. For that test, the failure against the unfixed code serves as its RED evidence.

Tests marked **⚠ expected bug** below are predicted to hit the bug protocol.

## Review Focus

These are the five failure modes most likely to bite someone using this suite. Each one is pinned by a test in the task named.

1. **The site under test reaches real Resend** (a stray server, or `.env.local` leaking in). Expected: impossible. Pinned by Task 4's "site sends through the fake" infra test, plus `reuseExistingServer: false` on the site server.
2. **Parallel browsers sharing the fake's state** (local `npm run test:e2e` runs 3 projects at once). Expected: no cross-talk. Pinned by Task 4's fake matching responses by subject. Task 13 uses a unique sender name per test and repeat.
3. **Visual tests run on macOS against Linux baselines.** Expected: they're skipped, not failed. Pinned by Task 2's `grepInvert` and Task 18's `test.skip(!process.env.E2E_DOCKER)`.
4. **A new MDX page or project is added.** Expected: it's covered automatically. Pinned by Task 3's content self-test (every `.mdx` file maps to a route) and Task 6's loop over `routes`.
5. **Lazy images missing from full-page screenshots** (blank cards in baselines). Expected: every image decoded before capture. Pinned by Task 18's eager-load step.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `playwright.config.ts` | Browser projects, servers, tags, screenshot defaults |
| `playwright.external.config.ts` | Live-site link checker only |
| `e2e/fixtures.ts` | `test`/`expect` with network guard + error collection; `allowedErrors` option |
| `e2e/content.ts` | `pages`, `routes`, `sidebarTitles()`, `latestPost` from `src/content` |
| `e2e/fake-resend.mjs` | Fake Resend API on port 3201 |
| `e2e/docker.sh` | Runs Playwright inside the official image with Linux `node_modules` |
| `e2e/infra.spec.ts` | Self-tests for the guard, content source, and fake |
| `e2e/functional/*.spec.ts` | Plan §3 |
| `e2e/ui/*.spec.ts` | Plan §4 |
| `e2e/external/links.spec.ts` | Plan §5 |
| `e2e/__screenshots__/` | Committed Linux baselines, keyed by project |
| `.github/workflows/e2e.yml`, `links.yml` | CI |

Deleted: `e2e/navigation.spec.ts`, `e2e/ui.spec.ts` (old scaffold, replaced).

---

### Task 1: Worktree, scaffolding move, docs commit, browsers

**Files:**
- Move from the main checkout into the worktree: `docs/`, `e2e/`, `playwright.config.ts`
- Modify (worktree): `package.json`, `package-lock.json`, `.gitignore`, `docs/test-plan.md`
- Restore (main checkout): `package.json`, `package-lock.json`, `.gitignore` back to `HEAD`

**Interfaces:** Produces the branch `test/e2e-suite` in `../codenotes-e2e` with Playwright, axe, and all three browsers installed.

- [ ] **Step 1: Create the worktree**

```bash
cd "/Users/justinlu/Desktop/Code Projects/codenotes"
git worktree add ../codenotes-e2e -b test/e2e-suite
```

- [ ] **Step 2: Move the uncommitted scaffold off `main`**

The user approved this plan, which includes this step. `src/components/sections/Hero.tsx` and `src/content/projects/wip.mdx` are the user's own work in progress: **do not touch them.**

```bash
cd "/Users/justinlu/Desktop/Code Projects/codenotes"
cp -R docs e2e playwright.config.ts ../codenotes-e2e/
rm -rf docs e2e playwright.config.ts test-results
git checkout -- package.json package-lock.json .gitignore
git status --short   # expect only Hero.tsx, wip.mdx and the .impeccable submodule entry
```

- [ ] **Step 3: Install dependencies and browsers in the worktree**

```bash
cd "/Users/justinlu/Desktop/Code Projects/codenotes-e2e"
npm install -D @playwright/test@1.64.0 @axe-core/playwright@^4.13.0
npm pkg set scripts.test:e2e="playwright test" \
  scripts.test:e2e:functional="playwright test --grep @functional" \
  scripts.test:e2e:a11y="playwright test --grep @a11y" \
  scripts.test:e2e:visual="sh e2e/docker.sh --grep @visual" \
  scripts.test:e2e:docker="sh e2e/docker.sh" \
  scripts.test:e2e:update="sh e2e/docker.sh --update-snapshots" \
  scripts.test:e2e:links="playwright test -c playwright.external.config.ts"
npx playwright install chromium firefox webkit
```

- [ ] **Step 4: Append the Playwright ignores to `.gitignore`**

```
# playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

- [ ] **Step 5: Apply the design's "Plan changes" to `docs/test-plan.md`**

Edit the scope section (below the brief) exactly as listed in the design doc's "Plan changes this design makes":

- **§1:**
  - The gallery route is `/gallery/test` (`/gallery` returns 404).
  - `public/_pagefind` is committed.
  - There is one blog post.
  - The theme control is the "Change theme" listbox (Light/Dark/System).
  - The navbar "Projects" link currently resolves to `/projects/laylocafe`.
- **§3.3:** add "marquee pauses on hover/focus" and "hero survives no WebGL".
- **§3.5:** add Resend `{ error }` being ignored.
- **§3.6:** "code blocks not indexed" is **not applicable**, because the content has no code blocks.
- **§2:** add stubbed gallery images.
- **§4.2:** full-page shots at phone and desktop only.
- **§7:** add these rows:
  - **#6:** the route ignores Resend's `{ error }`, so a failed send returns 200.
  - **#7:** the navbar "Projects" link points to `/projects/laylocafe`.
  - Mark **#5** as observed: home shows "September 3, 2025" for `date: 2025-09-04`.

- [ ] **Step 6: Verify**

```bash
npx playwright --version             # Version 1.64.0
npx playwright install --list | grep -E "chromium-|firefox-|webkit-"   # three browser dirs
git status --short                   # docs/, e2e/, playwright.config.ts, package*.json, .gitignore
```

- [ ] **Step 7: Commit**

```bash
git add docs .gitignore package.json package-lock.json playwright.config.ts e2e
git commit -m "docs: e2e test plan, design and implementation plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Config + fixtures (network guard, error collection)

**Files:**
- Rewrite: `playwright.config.ts`
- Create: `e2e/fixtures.ts`
- Create: `e2e/infra.spec.ts`
- Delete: `e2e/navigation.spec.ts`, `e2e/ui.spec.ts`

**Interfaces:**
- Produces: `import { test, expect } from './fixtures'` (or `'../fixtures'`).
- `test` has the option `allowedErrors: RegExp[]` (default `[]`) for console errors that a test expects.
- Projects are named `chromium`, `firefox`, and `webkit`.

- [ ] **Step 1: Write `playwright.config.ts`**

The site server here is temporary: `next start` against a build. Task 4 adds the fake Resend server and the env vars.

```ts
import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/external/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  grepInvert: process.env.E2E_DOCKER ? /@external/ : /@external|@visual/,
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL,
    timezoneId: 'America/New_York',
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { TZ: 'America/New_York' },
  },
})
```

- [ ] **Step 2: Write `e2e/fixtures.ts`**

```ts
import { test as base, expect } from '@playwright/test'

const STUBBED_HOSTS = ['images.react-photo-album.com']
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

export const test = base.extend<{ allowedErrors: RegExp[]; guard: void }>({
  allowedErrors: [[], { option: true }],
  guard: [
    async ({ page, allowedErrors }, use) => {
      const blocked: string[] = []
      const errors: string[] = []

      await page.route(
        (url) => url.hostname !== 'localhost',
        (route) => {
          const url = new URL(route.request().url())
          if (STUBBED_HOSTS.includes(url.hostname)) {
            return route.fulfill({ contentType: 'image/png', body: PIXEL })
          }
          blocked.push(url.href)
          return route.abort('blockedbyclient')
        },
      )
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        const text = message.text()
        // Failed HTTP statuses (404 pages, mocked 500s) are asserted by the tests themselves.
        if (message.type() !== 'error' || text.startsWith('Failed to load resource')) return
        if (!allowedErrors.some((pattern) => pattern.test(text))) errors.push(text)
      })

      await use()

      expect(blocked, 'unexpected external requests').toEqual([])
      expect(errors, 'page errors').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
```

- [ ] **Step 3: Write the guard self-tests in `e2e/infra.spec.ts`**

```ts
import { test, expect } from './fixtures'

test.describe('network guard', () => {
  test('fails a test that requests an external host', { tag: '@functional' }, async ({ page }) => {
    test.fail()
    await page.goto('/')
    await page.evaluate(() => fetch('https://example.com/').catch(() => undefined))
  })

  test('stubs gallery images instead of fetching them', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/gallery/test')
    const image = page.locator('main img').first()
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1)
  })
})

test.describe('error collection', () => {
  test('fails a test whose page throws', { tag: '@functional' }, async ({ page }) => {
    test.fail()
    await page.goto('/')
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('boom')
      })
    })
    await page.waitForEvent('pageerror')
  })

  test.describe('with allowedErrors', () => {
    test.use({ allowedErrors: [/expected noise/] })

    test('ignores console errors the test allows', { tag: '@functional' }, async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => console.error('expected noise'))
    })
  })
})
```

- [ ] **Step 4: Delete the old scaffold specs**

```bash
git rm e2e/navigation.spec.ts e2e/ui.spec.ts
```

- [ ] **Step 5: RED.** These breaks are in `e2e/fixtures.ts`; the guard's own code is what's under test. Apply one at a time:

| Break | Expected failure |
| --- | --- |
| Delete the `blocked.push(url.href)` line | "fails a test that requests an external host": `Expected to fail, but passed` |
| Change `PIXEL` route to `route.abort()` for stubbed hosts | "stubs gallery images": `naturalWidth` poll times out (Expected: 1, Received: 0) |
| Delete the `page.on('pageerror', …)` line | "fails a test whose page throws": `Expected to fail, but passed` |
| Remove the `allowedErrors.some(...)` condition (push always) | "ignores console errors": `page errors` contains `expected noise` |

Run each with `npx playwright test e2e/infra.spec.ts --project=chromium`.

- [ ] **Step 6: GREEN, then flake check**

```bash
# undo each break by hand (the file is not committed yet, so git checkout can't restore it)
npx playwright test e2e/infra.spec.ts --repeat-each=3
```

Expected: 12 tests × 3 = 36 passed, across chromium, firefox and webkit.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts e2e/fixtures.ts e2e/infra.spec.ts
git commit -m "test: playwright config and network/error guard fixture

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Content source (`e2e/content.ts`)

**Files:**
- Create: `e2e/content.ts`
- Modify: `e2e/infra.spec.ts` (append)

**Interfaces:** Produces:

```ts
export type Page = { route: string; title?: string; date?: string; hiddenFromNav: boolean }
export const pages: Page[]               // every .mdx under src/content/<section>/ (not the root index)
export const routes: string[]            // ['/', ...pages.map(p => p.route)]
export function sidebarTitles(section: string): string[]   // visible titles, in _meta.js order
export const latestPost: Page | undefined                  // newest /blog/* page with a date
```

- [ ] **Step 1: Write `e2e/content.ts`**

Playwright transpiles the imported `_meta.js` files (ESM `export default`) along with the specs, so plain static imports work.

```ts
import fs from 'node:fs'
import path from 'node:path'
import rootMeta from '../src/content/_meta.js'
import blogMeta from '../src/content/blog/_meta.js'
import galleryMeta from '../src/content/gallery/_meta.js'
import portfolioMeta from '../src/content/portfolio/_meta.js'
import projectsMeta from '../src/content/projects/_meta.js'

type MetaEntry = { title?: string; display?: string }
type Meta = Record<string, MetaEntry>

const CONTENT_DIR = path.join(__dirname, '../src/content')
const metas: Record<string, Meta> = {
  blog: blogMeta,
  gallery: galleryMeta,
  portfolio: portfolioMeta,
  projects: projectsMeta,
}

export type Page = { route: string; title?: string; date?: string; hiddenFromNav: boolean }

export const pages: Page[] = fs
  .readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap(({ name: section }) =>
    fs
      .readdirSync(path.join(CONTENT_DIR, section))
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => {
        const name = file.replace(/\.mdx$/, '')
        const source = fs.readFileSync(path.join(CONTENT_DIR, section, file), 'utf8')
        const entry = metas[section]?.[name] ?? {}
        return {
          route: name === 'index' ? `/${section}` : `/${section}/${name}`,
          title: entry.title ?? source.match(/^title:\s*(.+)$/m)?.[1],
          date: source.match(/^date:\s*(.+)$/m)?.[1],
          hiddenFromNav:
            entry.display === 'hidden' || (rootMeta as Meta)[section]?.display === 'hidden',
        }
      }),
  )

export const routes = ['/', ...pages.map((page) => page.route)]

export function sidebarTitles(section: string): string[] {
  return Object.values(metas[section] ?? {})
    .filter((entry) => entry.display !== 'hidden' && entry.title)
    .map((entry) => entry.title!)
}

export const latestPost = pages
  .filter((page) => page.route.startsWith('/blog/') && page.date)
  .sort((a, b) => b.date!.localeCompare(a.date!))[0]
```

If TypeScript complains about the `.js` imports, add `// @ts-expect-error untyped _meta.js` above each import. Do not add a `.d.ts` file.

- [ ] **Step 2: Append the content self-tests to `e2e/infra.spec.ts`**

```ts
import { execSync } from 'node:child_process'
import { latestPost, pages, routes, sidebarTitles } from './content'

test.describe('content source', () => {
  test('maps every mdx file to a route', { tag: '@functional' }, () => {
    const mdxFiles = execSync('find src/content -mindepth 2 -name "*.mdx"').toString().trim().split('\n')
    expect(pages).toHaveLength(mdxFiles.length)
    expect(routes).toContain('/projects/laylocafe')
    expect(routes).toContain('/gallery/test')
  })

  test('marks pages hidden in _meta.js as hidden from nav', { tag: '@functional' }, () => {
    const hidden = pages.filter((page) => page.hiddenFromNav).map((page) => page.route)
    expect(hidden).toEqual(expect.arrayContaining(['/projects/securechatapp', '/gallery/test']))
    expect(hidden).not.toContain('/projects/laylocafe')
  })

  test('lists sidebar titles in _meta.js order', { tag: '@functional' }, () => {
    expect(sidebarTitles('projects')[0]).toBe('Laylo Cafe')
    expect(sidebarTitles('projects')).not.toContain(undefined)
  })

  test('finds the newest dated blog post', { tag: '@functional' }, () => {
    expect(latestPost?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

Put the two new `import` lines at the top of the file, next to the existing import.

- [ ] **Step 3: RED.** Breaks in `e2e/content.ts`:

| Break | Expected failure |
| --- | --- |
| `.filter((file) => file.endsWith('.md'))` | "maps every mdx file": `Expected length: 2x, Received length: 0` |
| `hiddenFromNav: false` | "marks pages hidden": `expect.arrayContaining` mismatch |
| In `sidebarTitles`, change the filter to `entry.display === 'hidden'` | "lists sidebar titles": `Expected: "Laylo Cafe", Received: undefined` |
| Change the date regex to `/^data:\s*(.+)$/m` | "finds the newest": `Received: undefined` |

There's only one dated post, so sort order can't be shown failing. Note that in the task report.

Run: `npx playwright test e2e/infra.spec.ts --project=chromium -g "content source"`.

- [ ] **Step 4: GREEN + flake check**

```bash
npx playwright test e2e/infra.spec.ts --repeat-each=3
```

Expected: 24 tests × 3 = 72 passed.

- [ ] **Step 5: Commit**

```bash
git add e2e/content.ts e2e/infra.spec.ts
git commit -m "test: derive routes and expectations from src/content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Fake Resend server wired into the site

**Files:**
- Create: `e2e/fake-resend.mjs`
- Modify: `playwright.config.ts` (`webServer` becomes an array)
- Modify: `e2e/infra.spec.ts` (append)

**Interfaces:** Produces the fake at `http://localhost:3201`:
- `POST /emails`: the SDK's call. Replies with the first queued response whose `match` is a substring of `body.subject`; otherwise `200 { id: 'fake-email-id' }`.
- `POST /__next` with body `{ match: string, status: number, body: object }`: queues a response.
- `GET /__sent?match=<text>`: JSON array of recorded request bodies whose `subject` includes `<text>`.
- `GET /`: health check, returns `200 { ok: true }`.

The site's subject is `Portfolio Contact from ${name}`, so matching on a unique `name` isolates parallel tests.

- [ ] **Step 1: Write `e2e/fake-resend.mjs`**

```js
// Stand-in for api.resend.com during e2e runs. The site reaches it through
// RESEND_BASE_URL; tests steer it with /__next and inspect it with /__sent.
import http from 'node:http'

const PORT = 3201
const queue = []
const sent = []

function reply(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

http
  .createServer(async (req, res) => {
    let raw = ''
    for await (const chunk of req) raw += chunk
    const url = new URL(req.url, `http://localhost:${PORT}`)

    if (req.method === 'POST' && url.pathname === '/emails') {
      const email = JSON.parse(raw)
      sent.push(email)
      const index = queue.findIndex((queued) => email.subject.includes(queued.match))
      const next = index === -1 ? { status: 200, body: { id: 'fake-email-id' } } : queue.splice(index, 1)[0]
      return reply(res, next.status, next.body)
    }
    if (req.method === 'POST' && url.pathname === '/__next') {
      queue.push(JSON.parse(raw))
      return reply(res, 200, {})
    }
    if (req.method === 'GET' && url.pathname === '/__sent') {
      const match = url.searchParams.get('match') ?? ''
      return reply(res, 200, sent.filter((email) => email.subject.includes(match)))
    }
    if (req.method === 'GET' && url.pathname === '/') return reply(res, 200, { ok: true })
    reply(res, 404, { error: 'not found' })
  })
  .listen(PORT, () => console.log(`fake resend listening on ${PORT}`))
```

- [ ] **Step 2: Replace `webServer` in `playwright.config.ts`**

```ts
  webServer: [
    {
      command: 'node e2e/fake-resend.mjs',
      url: 'http://localhost:3201',
      reuseExistingServer: false,
    },
    {
      command: `npm run build && npx next start -p ${PORT}`,
      url: baseURL,
      // Never reuse: a server started outside Playwright could be holding the
      // real RESEND_API_KEY from .env.local and send real email.
      reuseExistingServer: false,
      timeout: 300_000,
      // Real environment variables win over .env.local in Next.js.
      env: {
        RESEND_BASE_URL: 'http://localhost:3201',
        RESEND_API_KEY: 're_fake_e2e',
        TZ: 'America/New_York',
      },
    },
  ],
```

- [ ] **Step 3: Append the infra tests to `e2e/infra.spec.ts`**

```ts
test.describe('fake resend', () => {
  test('site sends through the fake, never the real API', { tag: '@functional' }, async ({ request }, testInfo) => {
    const name = `Infra ${testInfo.testId}-${testInfo.repeatEachIndex}`
    const response = await request.post('/api/contact', {
      data: { name, email: 'infra@example.com', message: 'hello' },
    })
    expect(response.status()).toBe(200)

    const sent = await (await request.get(`http://localhost:3201/__sent?match=${encodeURIComponent(name)}`)).json()
    expect(sent).toHaveLength(1)
    expect(sent[0].subject).toBe(`Portfolio Contact from ${name}`)
  })

  test('returns a queued response only to the matching sender', { tag: '@functional' }, async ({ request }, testInfo) => {
    const name = `Queued ${testInfo.testId}-${testInfo.repeatEachIndex}`
    await request.post('http://localhost:3201/__next', {
      data: { match: name, status: 422, body: { name: 'validation_error', message: 'bad', statusCode: 422 } },
    })
    const other = await request.post('/api/contact', {
      data: { name: `Other ${testInfo.testId}-${testInfo.repeatEachIndex}`, email: 'o@example.com', message: 'x' },
    })
    expect(other.status()).toBe(200)

    await request.post('/api/contact', { data: { name, email: 'q@example.com', message: 'x' } })
    const sent = await (await request.get(`http://localhost:3201/__sent?match=${encodeURIComponent(name)}`)).json()
    expect(sent).toHaveLength(1)
  })
})
```

The second test only proves that matching is isolated: a non-matching sender gets the default 200, and the queued entry is consumed by its own sender. What the *site* does with a 422 is tested in Task 13 (⚠ bug #6).

- [ ] **Step 4: RED**

| Break | Expected failure |
| --- | --- |
| In `playwright.config.ts`, remove `RESEND_BASE_URL` from `env` **and** set `RESEND_API_KEY: 're_invalid'` (never the real key) | "site sends through the fake": the real Resend rejects the fake key, and the route's `catch` isn't reached because the SDK returns `{ error }`. So status may still be 200, but `sent` has length **0**: `Expected length: 1, Received length: 0` |
| In `fake-resend.mjs`, change `findIndex` to `findIndex(() => true)` | "returns a queued response only to the matching sender": `other` gets 422 → `Expected: 200, Received: 422` |

The first break makes one request to `api.resend.com` with an invalid key. That's acceptable here because nothing can be delivered. Revert it immediately.

- [ ] **Step 5: GREEN + flake check**

```bash
npx playwright test e2e/infra.spec.ts --repeat-each=3
```

Expected: all pass on 3 browsers, run in parallel. This also proves that parallel workers don't interfere.

- [ ] **Step 6: Commit**

```bash
git add e2e/fake-resend.mjs playwright.config.ts e2e/infra.spec.ts
git commit -m "test: fake Resend API for the contact route

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Docker runner

**Files:**
- Create: `e2e/docker.sh`

**Interfaces:** Produces `npm run test:e2e:docker -- <playwright args>` and `npm run test:e2e:update -- <args>`. Both run inside `mcr.microsoft.com/playwright:v1.64.0-noble` with `E2E_DOCKER=1`.

- [ ] **Step 1: Write `e2e/docker.sh`**

```sh
#!/bin/sh
# Runs Playwright inside the pinned Linux image so visual baselines match CI.
# node_modules and .next live in named volumes: the macOS builds of native
# packages (@tailwindcss/oxide, lightningcss, pagefind) don't run on Linux.
set -e
exec docker run --rm --ipc=host \
  -v "$PWD":/work \
  -v codenotes-e2e-node-modules:/work/node_modules \
  -v codenotes-e2e-next:/work/.next \
  -w /work \
  -e E2E_DOCKER=1 \
  mcr.microsoft.com/playwright:v1.64.0-noble \
  sh -c '[ node_modules/.package-lock.json -nt package-lock.json ] || npm ci; npx playwright test "$@"' -- "$@"
```

- [ ] **Step 2: Verify (Docker Desktop must be running: `docker info`)**

```bash
npm run test:e2e:docker -- e2e/infra.spec.ts
```

Expected: the first run performs `npm ci` and then everything passes. A second run skips `npm ci`.

- [ ] **Step 3: RED.** Change the image tag to `v1.63.0-noble`. Expected: Playwright errors that the browser executable doesn't match (`Executable doesn't exist` / version mismatch). This proves the image is tied to the installed Playwright version. Revert.

- [ ] **Step 4: Commit**

```bash
git add e2e/docker.sh
git commit -m "test: docker runner for linux-consistent runs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

**Infrastructure gate:** `npx playwright test` (host) and `npm run test:e2e:docker` must both be fully green before Task 6.

---

### Task 6: Routing and rendering (§3.1)

**Files:** Create `e2e/functional/routing.spec.ts`

**Interfaces:** Consumes `routes` from `../content`.

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'
import { routes } from '../content'

for (const route of routes) {
  test(`${route} renders`, { tag: '@functional' }, async ({ page }) => {
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.locator('article main')).toBeVisible()
    // The hidden gallery must never be linked from anywhere (sidebar, pagination, navbar).
    await expect(page.locator('a[href="/gallery/test"]')).toHaveCount(0)
  })
}

for (const route of ['/does-not-exist', '/projects/nope/nope', '/gallery']) {
  test(`${route} returns 404`, { tag: '@functional' }, async ({ page }) => {
    const response = await page.goto(route)
    expect(response?.status()).toBe(404)
  })
}

test('trailing slash resolves to the canonical route', { tag: '@functional' }, async ({ page }) => {
  const response = await page.goto('/projects/')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveURL('/projects')
})

test('every internal link resolves', { tag: '@functional' }, async ({ page, request }) => {
  const hrefs = new Set<string>()
  for (const route of routes) {
    await page.goto(route)
    for (const href of await page.locator('a[href^="/"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')!))) {
      hrefs.add(href.split('#')[0])
    }
  }
  const broken: string[] = []
  for (const href of hrefs) {
    if ((await request.get(href)).status() >= 400) broken.push(href)
  }
  expect(broken).toEqual([])
})

test('home has title and social metadata', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/\S/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Justin Lu Portfolio')
})
```

- [ ] **Step 2: RED** (one build with all breaks applied)

| Break | Expected failure |
| --- | --- |
| `src/app/[[...mdxPath]]/page.jsx`: first line of `Page`, add `if ((await props.params).mdxPath?.[0] === 'blog') throw new Error('x')` | every `/blog*` render test: `Expected: 200, Received: 500` |
| Remove `display: 'hidden'` from `gallery` in `src/content/_meta.js` **and** from `test` in `src/content/gallery/_meta.js` | Navigation renders a `/gallery/test` link: `toHaveCount(0)` fails on some route |
| `src/content/projects/_meta.js`: add `broken: { title: 'Broken', href: '/projects/missing' }` | "every internal link resolves": `broken` contains `/projects/missing` |
| `src/app/layout.tsx`: change `siteName` to `"x"` | metadata test: `Expected: "Justin Lu Portfolio"` |

Revert, and confirm `git diff --stat -- src` is empty.

- [ ] **Step 3: GREEN + flake check**

```bash
npx playwright test e2e/functional/routing.spec.ts --repeat-each=3
```

- [ ] **Step 4: Commit:** `git commit -m "test: routing and rendering"` (with trailer)

---

### Task 7: Navigation (§3.2)

**Files:** Create `e2e/functional/navigation.spec.ts`

**Interfaces:** Consumes `sidebarTitles`, `pages` from `../content`.

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'
import { pages, sidebarTitles } from '../content'

const navbar = (page: import('@playwright/test').Page) => page.getByRole('banner').getByRole('navigation')

test('navbar Projects link goes to the projects index', { tag: '@functional' }, async ({ page }) => {
  // ⚠ expected bug #7: the link currently resolves to /projects/laylocafe.
  await page.goto('/')
  await navbar(page).getByRole('link', { name: 'Projects', exact: true }).click()
  await expect(page).toHaveURL('/projects')
})

test('navbar Portfolio and Blog links land in their sections', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await navbar(page).getByRole('link', { name: 'Portfolio', exact: true }).click()
  await expect(page).toHaveURL('/portfolio/about')
  await navbar(page).getByRole('link', { name: 'Blog', exact: true }).click()
  await expect(page).toHaveURL(/\/blog(\/|$)/)
})

test('navbar marks the current section', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/portfolio/about')
  await expect(navbar(page).getByRole('link', { name: 'Portfolio', exact: true })).toHaveAttribute('aria-current', 'true')
  await expect(navbar(page).getByRole('link', { name: 'Blog', exact: true })).not.toHaveAttribute('aria-current', 'true')
})

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens, navigates and closes', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/projects/laylocafe')
    await page.getByRole('button', { name: 'Menu' }).click()
    const blog = page.getByRole('link', { name: 'Blog', exact: true }).filter({ visible: true })
    await expect(blog).toBeVisible()
    await blog.click()
    await expect(page).toHaveURL(/\/blog(\/|$)/)
    await expect(page.getByRole('link', { name: 'Portfolio', exact: true }).filter({ visible: true })).toHaveCount(0)
  })

  test('closes on Escape', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/projects/laylocafe')
    await page.getByRole('button', { name: 'Menu' }).click()
    await expect(page.getByRole('link', { name: 'Portfolio', exact: true }).filter({ visible: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('link', { name: 'Portfolio', exact: true }).filter({ visible: true })).toHaveCount(0)
  })
})

test('sidebar lists projects in _meta.js order', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/projects/laylocafe')
  await expect(page.getByRole('complementary').getByRole('link')).toHaveText(sidebarTitles('projects'))
})

test('pagination follows sidebar order', { tag: '@functional' }, async ({ page }) => {
  const [first, second] = sidebarTitles('projects')
  const route = (title: string) => pages.find((p) => p.title === title)!.route
  await page.goto(route(first))
  await expect(page.getByRole('article').getByRole('link', { name: second })).toHaveAttribute('href', route(second))
  await page.goto(route(second))
  await expect(page.getByRole('article').getByRole('link', { name: first })).toHaveAttribute('href', route(first))
})

test('social links open externally with accessible names', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  for (const [name, href] of [
    ['GitHub repository', 'https://github.com/jlu22003'],
    ['LinkedIn profile', 'https://www.linkedin.com/in/justin-lu-jkl/'],
  ]) {
    const link = navbar(page).getByRole('link', { name })
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noreferrer|noopener/)
  }
})

test('back and forward work after client-side navigation', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'View All Projects' }).click()
  await expect(page).toHaveURL('/projects')
  await page.goBack()
  await expect(page).toHaveURL('/')
  await page.goForward()
  await expect(page).toHaveURL('/projects')
})

test('table of contents scrolls to its heading', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/projects/laylocafe')
  await page.getByRole('navigation', { name: 'table of contents' }).getByRole('link', { name: 'Impact' }).click()
  await expect(page).toHaveURL(/#impact$/)
  await expect(page.locator('#impact')).toBeInViewport()
})
```

- [ ] **Step 2: RED**

| Break | Expected failure |
| --- | --- |
| `src/content/_meta.js`: `portfolio.title: "Work"` | Portfolio link tests: locator not found |
| `mv src/content/projects/tictactoe.mdx src/content/projects/tictactoe.mdx.bak` (the `_meta.js` entry stays, so `sidebarTitles` still expects "Tic Tac Toe") | Sidebar test: `toHaveText` array mismatch, "Tic Tac Toe" missing. Move the file back afterwards. |
| `src/app/layout.tsx`: `projectLink='https://github.com/x'` | social links: href mismatch |
| `src/content/projects/laylocafe.mdx`: rename the `## Impact` heading to `## Results` | TOC test: link "Impact" not found |
| Back/forward: `src/components/sections/Projects.tsx`: change `href={demoUrl}` to `href="/blog"` | `Expected URL /projects` |
| Mobile Escape / aria-current | Product code is Nextra's. If these pass on the unbroken site, RED = break the test's own precondition: in the Escape test, remove the `press('Escape')` line and confirm it then fails (the menu stays open). This proves the assertion can detect an open menu. |

Expected on the unbroken site: "navbar Projects link goes to the projects index" **fails** (⚠ bug #7). Follow the Bug Protocol. Its RED evidence is that failure.

- [ ] **Step 3: GREEN + flake check:** `npx playwright test e2e/functional/navigation.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: navigation`

---

### Task 8: Home sections, carousel, Latest Blog (§3.3 part 1)

**Files:** Create `e2e/functional/home.spec.ts`

**Interfaces:** Consumes `latestPost` from `../content`, and `projects` from `../../src/components/sections/Projects-Data`.

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'
import { latestPost } from '../content'
import { projects } from '../../src/components/sections/Projects-Data'

test('sections appear in order', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Justin K. Lu')
  await expect(page.locator('main h2')).toHaveText([
    'Projects',
    'Focus & Philosophy',
    'Skills',
    'Latest Writing',
    'Get in Touch',
  ])
})

test('project cards link to pages that exist', { tag: '@functional' }, async ({ page, request }) => {
  await page.goto('/')
  const cards = page.getByRole('link', { name: /^View project: / })
  await expect(cards).toHaveCount(projects.length)
  for (const [index, project] of projects.entries()) {
    await expect(cards.nth(index)).toHaveAttribute('href', project.url)
    expect((await request.get(project.url)).status()).toBe(200)
  }
})

test('carousel arrows page through projects', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  const previous = page.getByRole('button', { name: 'Previous Projects' })
  const next = page.getByRole('button', { name: 'Next Projects' })
  const first = page.getByRole('group', { name: `1 of ${projects.length}` })

  await expect(next).toBeEnabled() // carousel hydrated
  await expect(previous).toBeDisabled()
  await expect(first).toBeInViewport({ ratio: 1 })

  await next.focus()
  await page.keyboard.press('Enter')
  await expect(previous).toBeEnabled()
  await expect(first).not.toBeInViewport({ ratio: 1 })

  for (let i = 0; i < projects.length && (await next.isEnabled()); i++) await next.click()
  await expect(next).toBeDisabled()
})

test('latest writing shows the newest post with its front-matter date', { tag: '@functional' }, async ({ page }) => {
  // ⚠ expected bug #5: date-only front matter is parsed as UTC and rendered a day early.
  const expectedDate = new Date(`${latestPost!.date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  await page.goto('/')
  const section = page.getByRole('region', { name: 'Latest Writing' })
  await expect(section).toContainText(`${latestPost!.title} — ${expectedDate}`)
  await expect(section.getByRole('link', { name: /^Read the post: / })).toHaveAttribute('href', latestPost!.route)
})
```

- [ ] **Step 2: RED**

| Break | Expected failure |
| --- | --- |
| `src/content/index.mdx`: move `<Skills />` above `<Focus />` | Order test: array mismatch |
| `Projects.tsx`: `href={item.url + 'x'}` on the card `Link` | Card href mismatch |
| `Projects.tsx`: `onClick={() => carouselApi?.scrollPrev()}` on the **Next** button | `previous` stays disabled after Enter |
| `LatestBlog.tsx`: change `href={latestPost.route}` to `href="/blog"` | href mismatch |

Expected on the unbroken site: the Latest Writing test **fails** (⚠ bug #5). Follow the Bug Protocol.

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/functional/home.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: home sections and projects carousel`

---

### Task 9: Resume, marquee, reduced motion, no-WebGL (§3.3 part 2)

**Files:** Modify `e2e/functional/home.spec.ts` (append)

- [ ] **Step 1: Append**

```ts
async function frames(page: import('@playwright/test').Page, count: number) {
  await page.evaluate(
    (n) => new Promise<void>((resolve) => {
      let left = n
      const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick))
      requestAnimationFrame(tick)
    }),
    count,
  )
}

test('resume button downloads the PDF', { tag: '@functional' }, async ({ page, request }) => {
  await page.goto('/')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download Resume' }).click()
  expect((await download).suggestedFilename()).toBe('2025Resume.pdf')
  const pdf = await request.get('/2025Resume.pdf')
  expect(pdf.status()).toBe(200)
  expect(pdf.headers()['content-type']).toContain('application/pdf')
})

test('resume button hides while over the projects section', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Download Resume' })).toBeVisible()
  await page.locator('#projects').evaluate((el) => el.scrollIntoView({ block: 'end' }))
  await expect(page.getByRole('button', { name: 'Download Resume' })).toHaveCount(0) // aria-hidden
})

test('skills marquee moves and pauses on focus', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  const group = page.getByRole('group', { name: /^Build skills, scrolling/ })
  const row = group.locator(':scope > div')
  const transform = () => row.evaluate((el) => getComputedStyle(el).transform)

  const start = await transform()
  await expect.poll(transform).not.toBe(start)

  await group.focus()
  const paused = await transform()
  await frames(page, 30)
  expect(await transform()).toBe(paused)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('skills render statically', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('group', { name: /scrolling/ })).toHaveCount(0)
    await expect(page.locator('#skills').getByText('TypeScript', { exact: true })).toHaveCount(1)
  })
})

test('hero renders when WebGL is unavailable', { tag: '@functional' }, async ({ page }) => {
  // ⚠ possible bug: ParticleSphere creates WebGLRenderer without a guard.
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...(rest as []))
    } as typeof getContext
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // The guard fixture fails this test if the page threw.
})
```

- [ ] **Step 2: RED**

| Break | Expected failure |
| --- | --- |
| `ResumeDownloadButton.tsx`: `link.download = 'resume.pdf'` | `Expected: "2025Resume.pdf"` |
| `ResumeDownloadButton.tsx`: `const sectionIds = []` | hide test: count stays 1 |
| `Skills.tsx`: remove `onFocus={pause}` | pause test: transform changed |
| `Skills.tsx`: `setPrefersReducedMotion(false)` instead of `mediaQuery.matches` | reduced-motion test: group count 2 |
| WebGL | If it passes on the unbroken site, RED = add `throw new Error('webgl')` as the first line of `ParticleSphere`'s `useEffect` → the guard fixture reports the page error. If it fails on the unbroken site: ⚠ Bug Protocol. |

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/functional/home.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: resume download, marquee and motion fallbacks`

---

### Task 10: Contact form validation (§3.4 part 1)

**Files:** Create `e2e/functional/contact-form.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'
import type { Page } from '@playwright/test'

const FIELDS = ['First Name', 'Last Name', 'Email', 'Message'] as const

async function countApiCalls(page: Page) {
  const calls: unknown[] = []
  await page.route('**/api/contact', (route) => {
    calls.push(route.request().postDataJSON())
    return route.fulfill({ json: { message: 'Message sent successfully' } })
  })
  return calls
}

async function fill(page: Page, values: Partial<Record<(typeof FIELDS)[number], string>>) {
  for (const [label, value] of Object.entries(values)) await page.getByLabel(label, { exact: true }).fill(value)
}

const valid = { 'First Name': 'Ada', 'Last Name': 'Lovelace', Email: 'ada@example.com', Message: 'Hello' }
const submit = (page: Page) => page.getByRole('button', { name: 'Submit Contact Form' }).click()

test.beforeEach(async ({ page }) => {
  await page.goto('/#contact-me')
})

test('empty submit flags every field and sends nothing', { tag: '@functional' }, async ({ page }) => {
  const calls = await countApiCalls(page)
  await submit(page)
  await expect(page.getByRole('alert')).toContainText('Please fix the highlighted fields below.')
  for (const label of FIELDS) {
    const field = page.getByLabel(label, { exact: true })
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    const describedBy = await field.getAttribute('aria-describedby')
    await expect(page.locator(`#${describedBy}`)).toBeVisible()
  }
  expect(calls).toHaveLength(0)
})

for (const email of ['a@b', 'a@b.', 'has space@x.com']) {
  test(`rejects invalid email "${email}"`, { tag: '@functional' }, async ({ page }) => {
    const calls = await countApiCalls(page)
    await fill(page, { ...valid, Email: email })
    await submit(page)
    await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('#email-error')).toHaveText('Enter a valid email address.')
    expect(calls).toHaveLength(0)
  })
}

test('message stops at 2000 characters', { tag: '@functional' }, async ({ page }) => {
  const message = page.getByLabel('Message', { exact: true })
  await message.fill('x'.repeat(2000))
  await message.press('x')
  await expect(message).toHaveValue('x'.repeat(2000))
})

test('editing a field clears its error and the summary', { tag: '@functional' }, async ({ page }) => {
  await submit(page)
  const firstName = page.getByLabel('First Name', { exact: true })
  await firstName.fill('Ada')
  await expect(firstName).toHaveAttribute('aria-invalid', 'false')
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('sends the expected payload', { tag: '@functional' }, async ({ page }) => {
  const calls = await countApiCalls(page)
  await fill(page, valid)
  await submit(page)
  await expect(page.getByRole('status')).toContainText('Message sent successfully!')
  expect(calls).toEqual([{ name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello' }])
})
```

- [ ] **Step 2: RED** (all in `src/components/sections/Contact.tsx`)

| Break | Expected failure |
| --- | --- |
| In `handleSubmit`, delete the `if (Object.keys(errors).length > 0) {…}` block | empty submit: `calls` length 1 |
| `EMAIL_REGEX = /@/` | invalid email tests: `aria-invalid` is `false` |
| Remove `maxLength={MESSAGE_MAX_LENGTH}` | length test: value has 2001 characters |
| In `handleChange`, delete the `setFieldErrors(...)` call | clear test: `aria-invalid` stays `true` |
| `name: formData.firstName` (drop the last name) | payload: `name: "Ada"` |

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/functional/contact-form.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: contact form validation`

---

### Task 11: Contact form submission states (§3.4 part 2)

**Files:** Modify `e2e/functional/contact-form.spec.ts` (append)

- [ ] **Step 1: Append**

```ts
test('disables the form while sending and sends once', { tag: '@functional' }, async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => (release = resolve))
  let calls = 0
  await page.route('**/api/contact', async (route) => {
    calls++
    await gate
    await route.fulfill({ json: { message: 'Message sent successfully' } })
  })
  await fill(page, valid)
  const button = page.getByRole('button', { name: 'Submit Contact Form' })
  await button.click()
  await expect(button).toBeDisabled()
  await expect(button).toHaveText('Sending...')
  for (const label of FIELDS) await expect(page.getByLabel(label, { exact: true })).toBeDisabled()
  await button.click({ force: true })
  release()
  await expect(page.getByRole('status')).toBeVisible()
  expect(calls).toBe(1)
})

test('success message resets the form and clears after 5 seconds', { tag: '@functional' }, async ({ page }) => {
  await page.clock.install()
  await page.goto('/#contact-me')
  await countApiCalls(page)
  await fill(page, valid)
  await submit(page)
  await expect(page.getByRole('status')).toContainText('Message sent successfully!')
  for (const label of FIELDS) await expect(page.getByLabel(label, { exact: true })).toHaveValue('')
  await page.clock.fastForward(5000)
  await expect(page.getByRole('status')).toHaveCount(0)
})

test.describe('failures', () => {
  test.use({ allowedErrors: [/Contact form error/] })

  test('server error keeps input and allows resubmitting', { tag: '@functional' }, async ({ page }) => {
    let fail = true
    await page.route('**/api/contact', (route) =>
      fail
        ? route.fulfill({ status: 500, json: { error: 'Failed to send message. Please try again.' } })
        : route.fulfill({ json: { message: 'Message sent successfully' } }),
    )
    await fill(page, valid)
    await submit(page)
    await expect(page.getByRole('alert')).toContainText('Failed to send message. Please try again.')
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Hello')
    fail = false
    await submit(page)
    await expect(page.getByRole('status')).toContainText('Message sent successfully!')
  })

  test('network failure shows an error and keeps input', { tag: '@functional' }, async ({ page }) => {
    await page.route('**/api/contact', (route) => route.abort('failed'))
    await fill(page, valid)
    await submit(page)
    await expect(page.getByRole('alert')).toContainText('Failed to send message')
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue('ada@example.com')
  })
})

test('can be completed with the keyboard alone', { tag: '@functional' }, async ({ page }) => {
  const calls = await countApiCalls(page)
  await page.getByLabel('First Name', { exact: true }).focus()
  for (const value of ['Ada', 'Lovelace', 'ada@example.com', 'Hello']) {
    await page.keyboard.type(value)
    await page.keyboard.press('Tab')
  }
  await expect(page.getByRole('button', { name: 'Submit Contact Form' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toBeVisible()
  expect(calls).toHaveLength(1)
})
```

- [ ] **Step 2: RED** (in `Contact.tsx`)

| Break | Expected failure |
| --- | --- |
| On the submit `Button`, `disabled={false}` | pending test: `toBeDisabled` fails |
| `setTimeout(() => setStatus("idle"), 50000)` | 5-second test: status still visible |
| Remove `setFormData({ firstName: "", … })` after success | reset test: value `Ada` |
| In `catch`, `setStatus("idle")` | failure tests: alert not found |
| On the Message `Textarea`, add `tabIndex={-1}` | keyboard test: the submit button isn't focused |

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/functional/contact-form.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: contact form submission states`

---

### Task 12: Contact API validation contract (§3.5 part 1)

**Files:** Create `e2e/functional/contact-api.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello' }
const FIELD_IN_RESPONSE = { name: 'firstName', email: 'email', message: 'message' } as const

for (const field of ['name', 'email', 'message'] as const) {
  for (const value of [undefined, '']) {
    test(`${field} ${value === undefined ? 'missing' : 'empty'} → 400`, { tag: '@functional' }, async ({ request }) => {
      const response = await request.post('/api/contact', { data: { ...valid, [field]: value } })
      expect(response.status()).toBe(400)
      expect((await response.json()).field).toBe(FIELD_IN_RESPONSE[field])
    })
  }
}

test('malformed email → 400', { tag: '@functional' }, async ({ request }) => {
  const response = await request.post('/api/contact', { data: { ...valid, email: 'not-an-email' } })
  expect(response.status()).toBe(400)
  expect((await response.json()).field).toBe('email')
})

test('message over 2000 characters → 400', { tag: '@functional' }, async ({ request }) => {
  const response = await request.post('/api/contact', { data: { ...valid, message: 'x'.repeat(2001) } })
  expect(response.status()).toBe(400)
  expect((await response.json()).field).toBe('message')
})

test('GET is not allowed', { tag: '@functional' }, async ({ request }) => {
  expect((await request.get('/api/contact')).status()).toBe(405)
})

test('malformed JSON → 400', { tag: '@functional' }, async ({ request }) => {
  // ⚠ expected bug #3: request.json() throws inside try and the catch returns 500.
  const response = await request.post('/api/contact', {
    headers: { 'content-type': 'application/json' },
    data: '{not json',
  })
  expect(response.status()).toBe(400)
})

for (const message of [123, ['x']]) {
  test(`non-string message ${JSON.stringify(message)} → 400`, { tag: '@functional' }, async ({ request }) => {
    // ⚠ expected bug #4: no type check, so .replace throws and the catch returns 500.
    const response = await request.post('/api/contact', { data: { ...valid, message } })
    expect(response.status()).toBe(400)
    expect((await response.json()).field).toBe('message')
  })
}
```

- [ ] **Step 2: RED** (in `src/app/api/contact/route.ts`)

| Break | Expected failure |
| --- | --- |
| Delete the `if (!name)` block | name tests: 200 instead of 400 |
| `field: "mail"` in the email-required block | email missing/empty: field mismatch |
| `emailRegex = /@/` | malformed email: 200 |
| `MESSAGE_MAX_LENGTH = 5000` | over-2000: 200 |
| `export async function GET() { return NextResponse.json({}) }` | GET: 200 instead of 405 |

The 400 cases never reach the fake. The cases that would reach it (all field values valid) don't occur here.

Expected on the unbroken site: malformed JSON (⚠ #3) and non-string message (⚠ #4) **fail**. Follow the Bug Protocol.

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/functional/contact-api.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: contact api validation contract`

---

### Task 13: Contact API delivery through fake Resend (§3.5 part 2)

**Files:** Modify `e2e/functional/contact-api.spec.ts` (append)

- [ ] **Step 1: Append**

```ts
import type { APIRequestContext, TestInfo } from '@playwright/test'

const FAKE = 'http://localhost:3201'
const sender = (testInfo: TestInfo) => `Api ${testInfo.testId}-${testInfo.repeatEachIndex}`
const sentTo = async (request: APIRequestContext, name: string) =>
  (await request.get(`${FAKE}/__sent?match=${encodeURIComponent(name)}`)).json()

test('valid message is delivered to Resend', { tag: '@functional' }, async ({ request }, testInfo) => {
  const name = sender(testInfo)
  const response = await request.post('/api/contact', { data: { ...valid, name, message: 'x'.repeat(2000) } })
  expect(response.status()).toBe(200)
  const [email] = await sentTo(request, name)
  expect(email.subject).toBe(`Portfolio Contact from ${name}`)
  expect([email.reply_to, email.replyTo].flat()).toContain(valid.email)
})

test('Resend error is reported as a failure', { tag: '@functional' }, async ({ request }, testInfo) => {
  // ⚠ expected bug #6: the SDK returns { error } instead of throwing and the route ignores it.
  const name = sender(testInfo)
  await request.post(`${FAKE}/__next`, {
    data: { match: name, status: 422, body: { name: 'validation_error', message: 'secret detail', statusCode: 422 } },
  })
  const response = await request.post('/api/contact', { data: { ...valid, name } })
  expect(response.status()).toBe(500)
  const body = await response.json()
  expect(body).toEqual({ error: 'Failed to send message. Please try again.' })
})

test('message HTML is escaped in the email', { tag: '@functional' }, async ({ request }, testInfo) => {
  // ⚠ expected bug #2: user input is interpolated into the HTML unescaped.
  const name = sender(testInfo)
  await request.post('/api/contact', { data: { ...valid, name, message: '<img src=x onerror=alert(1)>' } })
  const [email] = await sentTo(request, name)
  expect(email.html).not.toContain('<img src=x')
  expect(email.html).toContain('&lt;img src=x')
})
```

Move the `import type` line to the top of the file.

- [ ] **Step 2: RED**

| Break | Expected failure |
| --- | --- |
| `route.ts`: `subject: \`Contact from ${name}\`` | delivered: subject mismatch |
| `route.ts`: `replyTo: undefined` | delivered: `reply_to` missing |
| `route.ts`: `MESSAGE_MAX_LENGTH = 1999` | delivered: 400 instead of 200 (boundary) |

Expected on the unbroken site: "Resend error" (⚠ #6) and "HTML is escaped" (⚠ #2) **fail**. Follow the Bug Protocol. If both are approved, fix them in one `fix:` commit: check `const { error } = await resend.emails.send(...)` and throw if it's set; escape `name`/`email`/`message` with a small local `escapeHtml` in `route.ts`.

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/functional/contact-api.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: contact api delivery via fake resend`

---

### Task 14: Search (§3.6)

**Files:** Create `e2e/functional/search.spec.ts`

**Interfaces:** Consumes `pages`, `sidebarTitles` from `../content`.

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'
import { pages, sidebarTitles } from '../content'

const title = sidebarTitles('projects')[0]
const route = pages.find((page) => page.title === title)!.route
const query = title.slice(0, 4).toLowerCase() // partial and different case

test('finds a project by partial, case-insensitive title', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox', { name: 'Search...' }).fill(query)
  const result = page.getByRole('option').filter({ hasText: title }).first()
  await expect(result).toBeVisible()
  await result.click()
  await expect(page).toHaveURL(new RegExp(`${route}(#.*)?$`))
})

test('shows an empty state for no matches', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox', { name: 'Search...' }).fill('zqxjvw')
  await expect(page.getByText('No results found.')).toBeVisible()
})

test('works from the keyboard', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('ControlOrMeta+k')
  await expect(page.getByRole('combobox', { name: 'Search...' })).toBeFocused()
  await page.keyboard.type(query)
  await expect(page.getByRole('option').first()).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page).not.toHaveURL('/')
})
```

If `No results found.` isn't Nextra 4.6's exact copy, read it from `node_modules/nextra/dist` (grep `No results`) and use that string. That's a selector fix, not a bug.

- [ ] **Step 2: RED**

| Break | Expected failure |
| --- | --- |
| `package.json`: `"postbuild": "true"` **and** `rm -rf public/_pagefind` | All three: no options, `toBeVisible` times out |
| `src/app/layout.tsx`: `const search = null` | Combobox not found |

Restore `public/_pagefind` with `git checkout -- public/_pagefind`.

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/functional/search.spec.ts --repeat-each=3`

The build rewrites `public/_pagefind`. Do **not** commit those changes: run `git checkout -- public/_pagefind` before each commit.

- [ ] **Step 4: Commit:** `test: search`

---

### Task 15: Responsive (§4.2)

**Files:** Create `e2e/ui/responsive.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'
import { routes } from '../content'

const VIEWPORTS = {
  narrow: { width: 320, height: 640 },
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
}

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(name, () => {
    test.use({ viewport })

    test('no route scrolls horizontally', { tag: '@functional' }, async ({ page }) => {
      const overflowing: string[] = []
      for (const route of routes) {
        await page.goto(route)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        if (overflow > 0) overflowing.push(`${route} (+${overflow}px)`)
      }
      expect(overflowing).toEqual([])
    })
  })
}

for (const [width, mobile] of [[767, true], [768, false]] as const) {
  test(`navbar at ${width}px uses the ${mobile ? 'mobile menu' : 'inline links'}`, { tag: '@functional' }, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ visible: mobile })
    await expect(page.getByRole('banner').getByRole('link', { name: 'Portfolio', exact: true })).toBeVisible({ visible: !mobile })
  })
}

test('hero fills the first screen', { tag: '@functional' }, async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.laptop)
  await page.goto('/')
  const hero = page.locator('section', { has: page.locator('#particle-sphere-background') })
  const box = (await hero.boundingBox())!
  expect(Math.abs(box.y + box.height - VIEWPORTS.laptop.height)).toBeLessThanOrEqual(1)
})

test.describe('phone', () => {
  test.use({ viewport: VIEWPORTS.phone })

  test('shows one full project card at a time', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/')
    await page.locator('#projects').scrollIntoViewIfNeeded()
    const card = (n: number) => page.getByRole('group', { name: new RegExp(`^${n} of `) })
    await expect(card(1)).toBeInViewport({ ratio: 1 })
    await expect(card(2)).not.toBeInViewport({ ratio: 1 })
  })

  test('tap targets are at least 44×44', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/')
    const small: string[] = []
    for (const name of ['Menu', 'Previous Projects', 'Next Projects', 'Download Resume']) {
      const box = (await page.getByRole('button', { name }).boundingBox())!
      if (box.width < 44 || box.height < 44) small.push(`${name} ${box.width}×${box.height}`)
    }
    expect(small).toEqual([])
  })
})
```

The long-content edge case (§4.2) is **skipped**: there's no fixture content with long titles or URLs (decision 3). List it in the final summary.

- [ ] **Step 2: RED**

| Break | Expected failure |
| --- | --- |
| `src/app/globals.css`: add `body::after { content: ''; display: block; width: 2000px; height: 1px; }` | overflow at every size except desktop: `overflowing` not empty |
| `Hero.tsx`: `${STATUS_LINE_HEIGHT_PX + 40}px` | hero: off by 40 |
| `Projects.tsx`: `CarouselItem className="pl-4 basis-1/2 md:max-w-[452px]"` | phone: card 2 fully visible |
| Projects arrows: `size="sm"` | tap targets: a button smaller than 44 |
| Breakpoint test | Nextra-owned. RED = run the 767 case with `mobile` flipped (temporary edit to the test) to show it can fail, then restore. |

Possible real bugs on the unbroken site: the 320px overflow (the `h1` is `whitespace-nowrap`) and tap targets. Follow the Bug Protocol.

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/ui/responsive.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: responsive layout`

---

### Task 16: Theming (§4.3)

**Files:** Create `e2e/ui/theme.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'

const switcher = (page: import('@playwright/test').Page) => page.locator('button[title="Change theme"]:visible').first()

async function choose(page: import('@playwright/test').Page, theme: 'Light' | 'Dark' | 'System') {
  await switcher(page).click()
  await page.getByRole('option', { name: theme }).click()
}

test('switcher applies and stores each theme', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await choose(page, 'Dark')
  await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark')
  await choose(page, 'Light')
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light')
})

test('choice survives reload and navigation without a flash', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await choose(page, 'Dark')
  await page.goto('/projects', { waitUntil: 'domcontentloaded' })
  // Not auto-retrying on purpose: the class must already be there at first paint.
  expect(await page.locator('html').getAttribute('class')).toMatch(/\bdark\b/)
  await page.reload({ waitUntil: 'domcontentloaded' })
  expect(await page.locator('html').getAttribute('class')).toMatch(/\bdark\b/)
})

test.describe('system preference', () => {
  test.use({ colorScheme: 'dark' })

  test('follows the OS when nothing is stored', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })
})

test('dark theme dropdown matches the page background', { tag: '@visual' }, async ({ page }) => {
  await page.goto('/')
  await choose(page, 'Dark')
  await switcher(page).click()
  const [listbox, body] = await page.evaluate(() => {
    const toRgb = (color: string) => {
      const ctx = document.createElement('canvas').getContext('2d')!
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)).join(',')
    }
    const list = document.querySelector('[role="listbox"]')!
    return [toRgb(getComputedStyle(list).backgroundColor), toRgb(getComputedStyle(document.body).backgroundColor)]
  })
  expect(listbox).toBe(body)
})
```

The last test is tagged `@visual` because it's about rendered colour, but it doesn't use a baseline, so it runs fine on the host. Run it explicitly with `--grep "dropdown"` during RED/GREEN, since the default host run excludes `@visual`.

- [ ] **Step 2: RED**

| Break | Expected failure |
| --- | --- |
| `layout.tsx`: `<Layout … nextThemes={{ storageKey: 'x' }}>` | stored-theme test: `localStorage.theme` is null |
| `layout.tsx`: `<Layout … nextThemes={{ defaultTheme: 'light', enableSystem: false }}>` | system test: no `dark` class |
| `layout.tsx` `backgroundColor`: `dark: "rgb(17,17,17)"` | dropdown test: `43,43,43` vs `17,17,17` |
| No-flash test | RED = change the test's `waitUntil` to `'commit'` and confirm it fails (the class isn't present yet), proving the check is timing-sensitive. Then restore. |

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/ui/theme.spec.ts --repeat-each=3 --grep-invert @external`

`--grep-invert` overrides the config's `grepInvert`, so `@visual` runs here.

- [ ] **Step 4: Commit:** `test: theming`

---

### Task 17: Accessibility (§4.4)

**Files:** Create `e2e/ui/a11y.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '../fixtures'
import { routes } from '../content'

for (const route of routes) {
  test(`${route} has no serious axe violations`, { tag: '@a11y' }, async ({ page }) => {
    const found: string[] = []
    for (const theme of ['light', 'dark']) {
      for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
        await page.setViewportSize(viewport)
        await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
        await page.goto(route)
        const { violations } = await new AxeBuilder({ page }).analyze()
        for (const v of violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')) {
          found.push(`${theme} ${viewport.width}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
        }
      }
    }
    expect(found).toEqual([])
  })

  test(`${route} has one h1, ordered headings and landmarks`, { tag: '@a11y' }, async ({ page }) => {
    await page.goto(route)
    await expect(page.locator('h1')).toHaveCount(1)
    const levels = await page.locator('main :is(h1,h2,h3,h4,h5,h6)').evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])))
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], `heading ${i} skips a level`).toBeLessThanOrEqual(levels[i - 1] + 1)
    }
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('banner').getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.locator('main img:not([alt])')).toHaveCount(0)
    await expect(page.locator('main svg:not([aria-hidden="true"]):not([role="img"])')).toHaveCount(0)
  })
}

test('keyboard reaches key controls with a visible focus ring', { tag: '@a11y' }, async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit only tabs to links with Option+Tab')
  await page.goto('/')
  const reached: string[] = []
  const noRing: string[] = []
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      const style = getComputedStyle(el)
      const name = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? el.tagName
      return { name, ring: style.outlineStyle !== 'none' || style.boxShadow !== 'none' }
    })
    reached.push(info.name)
    if (!info.ring) noRing.push(info.name)
  }
  const order = ['Skip to Content', 'Portfolio', 'Next Projects', 'Submit Contact Form']
  const positions = order.map((name) => reached.indexOf(name))
  expect(positions, `reached: ${reached.join(' | ')}`).not.toContain(-1)
  expect(positions).toEqual([...positions].sort((a, b) => a - b))
  expect(noRing).toEqual([])
})

test('AccessibilityPatches labels and sizes icon-only listbox buttons', { tag: '@a11y' }, async ({ page }) => {
  await page.goto('/projects/laylocafe')
  const buttons = page.locator('button[aria-haspopup="listbox"]:visible')
  await expect(buttons.first()).toBeVisible()
  for (const button of await buttons.all()) {
    await expect(button).toHaveAttribute('aria-label', /\S/)
    const box = (await button.boundingBox())!
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(48)
  }
})
```

Live regions are covered by Task 10/11 (`role="status"` / `role="alert"`), and reduced motion by Task 9. Don't duplicate them.

- [ ] **Step 2: RED**

| Break | Expected failure |
| --- | --- |
| Already failing: `LatestBlog.tsx:61` contrast (⚠ bug #1) | `/` axe test: `color-contrast` on light 390/1280 |
| `Focus.tsx`: add `<h1 className="sr-only">x</h1>` | `/` h1 count: Expected 1, Received 2 |
| `Contact.tsx`: remove `aria-label="Submit Contact Form"` | keyboard: `Submit Contact Form` not reached (-1) |
| `globals.css`: `*:focus-visible { outline: none !important; box-shadow: none !important; }` | `noRing` not empty |
| `AcessibilityPatches.tsx`: comment out `btn.style.minHeight = '48px'` | patches: below 48 |

Expected on the unbroken site: `/` axe fails (⚠ #1). Follow the Bug Protocol. The fix is already known: `text-accent-foreground/70` → a token that reaches ≥4.5:1. Run axe after the fix to confirm it passes.

- [ ] **Step 3: GREEN + flake:** `npx playwright test e2e/ui/a11y.spec.ts --repeat-each=3`
- [ ] **Step 4: Commit:** `test: accessibility`

---

### Task 18: Visual regression (§4.1), Docker only

**Files:**
- Create: `e2e/ui/visual.spec.ts`
- Create: `e2e/__screenshots__/**` (generated)

**Interfaces:** Consumes `latestPost`, `pages`, `sidebarTitles`.

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from '../fixtures'
import type { Page } from '@playwright/test'
import { latestPost, pages, sidebarTitles } from '../content'

test.skip(!process.env.E2E_DOCKER, 'Baselines are Linux-only: run npm run test:e2e:docker')
test.use({ reducedMotion: 'reduce' })

const project = pages.find((p) => p.title === sidebarTitles('projects')[0])!.route
const FULL_PAGES = ['/', '/projects', project, '/blog', latestPost!.route, '/portfolio/about']
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
}

async function settle(page: Page, route: string, theme: 'light' | 'dark') {
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
  await page.goto(route)
  await page.evaluate(async () => {
    await document.fonts.ready
    const images = Array.from(document.images)
    images.forEach((img) => (img.loading = 'eager'))
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)))
  })
}

const dynamic = (page: Page) => [
  page.getByRole('contentinfo'), // copyright year
  page.locator('time'), // "Last updated on"
  page.locator('#particle-sphere-background'),
  page.locator('#latest-blog-heading + p'), // post date
]

for (const route of FULL_PAGES) {
  for (const theme of ['light', 'dark'] as const) {
    for (const size of ['phone', 'desktop'] as const) {
      test(`${route} ${theme} ${size}`, { tag: '@visual' }, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS[size])
        await settle(page, route, theme)
        await expect(page).toHaveScreenshot(`${route.replaceAll('/', '_') || '_home'}-${theme}-${size}.png`, {
          fullPage: true,
          mask: dynamic(page),
        })
      })
    }
  }
}

for (const [size, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`components ${size}`, () => {
    test.use({ viewport })

    test('hero, project card, navbar', { tag: '@visual' }, async ({ page }) => {
      await settle(page, '/', 'light')
      const hero = page.locator('section', { has: page.locator('#particle-sphere-background') })
      await expect(hero).toHaveScreenshot(`hero-${size}.png`, { mask: dynamic(page) })
      await expect(page.getByRole('group', { name: /^1 of / })).toHaveScreenshot(`project-card-${size}.png`)
      await expect(page.getByRole('banner')).toHaveScreenshot(`navbar-${size}.png`)
    })

    test('contact form states', { tag: '@visual' }, async ({ page }) => {
      await page.route('**/api/contact', (route) => route.fulfill({ json: { message: 'ok' } }))
      await settle(page, '/', 'light')
      const card = page.locator('#contact-me form').locator('xpath=ancestor::*[contains(@class,"rounded")][1]')
      await expect(card).toHaveScreenshot(`contact-idle-${size}.png`)
      await page.getByRole('button', { name: 'Submit Contact Form' }).click()
      await expect(card).toHaveScreenshot(`contact-error-${size}.png`)
      for (const [label, value] of [['First Name', 'Ada'], ['Last Name', 'Lovelace'], ['Email', 'ada@example.com'], ['Message', 'Hello']]) {
        await page.getByLabel(label, { exact: true }).fill(value)
      }
      await page.getByRole('button', { name: 'Submit Contact Form' }).click()
      await expect(page.getByRole('status')).toBeVisible()
      await expect(card).toHaveScreenshot(`contact-success-${size}.png`)
    })
  })
}

test('focus rings', { tag: '@visual' }, async ({ page }) => {
  await settle(page, '/', 'light')
  for (const [name, target] of [
    ['button', page.getByRole('button', { name: 'Submit Contact Form' })],
    ['link', page.getByRole('link', { name: 'View All Projects' })],
    ['input', page.getByLabel('First Name', { exact: true })],
  ] as const) {
    await target.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab') // keyboard focus, so :focus-visible applies
    await expect(target).toHaveScreenshot(`focus-${name}.png`)
  }
})
```

If the `xpath=ancestor` card locator matches nothing, use `page.locator('#contact-me form').locator('..')` and pick the nearest wrapper that includes the status/alert banner. Check it in the trace. That's a selector fix.

- [ ] **Step 2: Generate baselines**

Docker Desktop must be running.

```bash
npm run test:e2e:update -- e2e/ui/visual.spec.ts
ls e2e/__screenshots__/*/ui/visual.spec.ts | head
```

Expected: 3 browser folders. Per browser that's 24 full-page images and 27 component images (6 component shots × 4 sizes, plus 3 focus shots).

**Open several images and look at them**, in both themes, at phone and desktop sizes. Check that cards have real images (not blanks), masks cover only the dynamic regions, and there's no dev badge. A baseline that captures a broken state is worse than none.

- [ ] **Step 3: RED**

| Break | Expected failure |
| --- | --- |
| `globals.css`: change the light `--background` token's lightness by ~0.05 | Every light full-page shot: pixel diff over threshold |
| `Contact.tsx`: change the error banner class `bg-destructive/10` → `bg-destructive/40` | `contact-error-*` diffs only |
| `button.tsx`: remove the `focus-visible:ring-*` classes | `focus-button` diff |

Run with `npm run test:e2e:docker -- e2e/ui/visual.spec.ts` and keep the diff images from `test-results/` as evidence.

- [ ] **Step 4: GREEN + flake:** `npm run test:e2e:docker -- e2e/ui/visual.spec.ts --repeat-each=3`
- [ ] **Step 5: Commit:** `git add e2e/ui/visual.spec.ts e2e/__screenshots__ && git commit -m "test: visual regression baselines"` (with trailer)

---

### Task 19: External link suite (§5)

**Files:**
- Create: `playwright.external.config.ts`
- Create: `e2e/external/links.spec.ts`

- [ ] **Step 1: `playwright.external.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/external',
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 120_000,
  use: { baseURL: 'https://www.justinklu.com' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

- [ ] **Step 2: `e2e/external/links.spec.ts`**

This spec imports from `@playwright/test` directly, because the fixture's network guard would block the very hosts it checks. That's the one exception to the import rule; say so in a comment.

```ts
// Imports Playwright directly: the e2e fixture blocks external hosts, which is what this suite checks.
import { test, expect } from '@playwright/test'
import { routes } from '../content'

const SOFT_FAIL = [403, 429, 999] // bot walls (LinkedIn returns 999)

test('every external link on the live site responds', { tag: '@external' }, async ({ page, request }) => {
  const links = new Set<string>()
  for (const route of routes) {
    await page.goto(route)
    for (const href of await page.locator('a[href^="http"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))) {
      if (!href.startsWith('https://www.justinklu.com')) links.add(href)
    }
  }
  const broken: string[] = []
  for (const url of links) {
    const response = await request.get(url, { timeout: 10_000, maxRedirects: 5 }).catch((e: Error) => e)
    if (response instanceof Error) broken.push(`${url} (${response.message.split('\n')[0]})`)
    else if (SOFT_FAIL.includes(response.status())) test.info().annotations.push({ type: 'warning', description: `${url} → ${response.status()}` })
    else if (response.status() >= 400) broken.push(`${url} → ${response.status()}`)
  }
  expect(broken).toEqual([])
})
```

- [ ] **Step 3: RED.** Temporarily push `'https://justinklu.com/definitely-missing-page'` into `links` before the loop. Expected: `broken` contains it with status 404. Revert.

- [ ] **Step 4: GREEN:** `npm run test:e2e:links`. Then confirm the default run excludes it: `npx playwright test --list | grep -c external` prints `0`.

Run it 3 times (`--repeat-each=3`). If a third-party site is flaky, note it in the report but don't change the threshold.

- [ ] **Step 5: Commit:** `test: external link checker (excluded from default run)`

---

### Task 20: CI workflows

**Files:**
- Create: `.github/workflows/e2e.yml`
- Create: `.github/workflows/links.yml`

- [ ] **Step 1: `.github/workflows/e2e.yml`**

```yaml
name: e2e

on:
  pull_request:
    paths-ignore: ['docs/**', '**/*.md', '.impeccable/**']
  push:
    branches: [main]
    paths-ignore: ['docs/**', '**/*.md', '.impeccable/**']

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: ${{ matrix.browser }}
    runs-on: ubuntu-latest
    timeout-minutes: 20
    container:
      image: mcr.microsoft.com/playwright:v1.64.0-noble
      options: --ipc=host
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    env:
      E2E_DOCKER: '1'
      HOME: /root
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test --project=${{ matrix.browser }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: report-${{ matrix.browser }}
          path: |
            playwright-report/
            test-results/
          retention-days: 7
```

- [ ] **Step 2: `.github/workflows/links.yml`**

```yaml
name: links

on:
  schedule:
    - cron: '0 13 * * 1' # Mondays 09:00 New York (EDT)
  workflow_dispatch:

jobs:
  links:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    container:
      image: mcr.microsoft.com/playwright:v1.64.0-noble
      options: --ipc=host
    env:
      HOME: /root
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:e2e:links
```

- [ ] **Step 3: Verify with actionlint (in Docker; nothing is pushed)**

```bash
docker run --rm -v "$PWD":/repo -w /repo rhysd/actionlint:latest -color
```

Expected: no output, exit code 0.

RED: change `timeout-minutes: 20` to `timeout-minutes: twenty`. Expected: actionlint reports a type error. Revert.

- [ ] **Step 4: Rehearse a CI job locally**

```bash
docker run --rm --ipc=host -e CI=1 -e E2E_DOCKER=1 -v "$PWD":/work -v codenotes-e2e-ci-nm:/work/node_modules -w /work \
  mcr.microsoft.com/playwright:v1.64.0-noble sh -c 'npm ci && npx playwright test --project=webkit'
```

Expected: green, with the `github` reporter output.

- [ ] **Step 5: Commit:** `ci: e2e matrix per browser and weekly link check`

---

### Task 21: Phase 4 handoff (not a subagent task)

The orchestrator runs these directly, following the brief's Phase 4:

1. **Verify** (superpowers:verification-before-completion):
   - `npx playwright test` on the host: all three browsers, everything except `@visual`.
   - `npm run test:e2e:docker`: everything including `@visual`.
   - Paste both outputs.
2. **Review:** superpowers:requesting-code-review on the whole branch (`git diff main...test/e2e-suite`). Address the findings.
3. **Finish:** superpowers:finishing-a-development-branch. The summary must include:
   - tests per tag (`npx playwright test --list --grep @functional | tail -1`, and the same for each tag)
   - real bugs found, and their fix commits
   - plan items skipped and why: long-content edge case, post-without-date ordering, code-block search, and real Resend smoke
   - the commands for each suite
4. **Owner settings checklist** for the user. These are account and repo settings, not code:
   - Keep the Actions spending limit at $0.
   - Optionally require the `e2e` checks on `main`.
