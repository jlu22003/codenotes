# Task: Build the E2E test suite for my portfolio site

I want a comprehensive E2E test suite in two parts: a functional suite (behavior)
and a UI suite (visual regression, responsive, theming, accessibility, cross-browser).
The full test plan with edge cases is in `docs/test-plan.md`. Read it first; it is
the source of truth for scope.

Use the Superpowers workflow end to end. Do not skip phases.

## Phase 1: Brainstorm (use the brainstorming skill)
- Explore the codebase before asking me anything: routes, components, data sources,
  the contact form backend, theme handling, build/deploy setup.
- Reconcile `docs/test-plan.md` against what actually exists. List plan items that
  don't apply, and anything in the code the plan missed.
- Ask me one question at a time about real decisions only, e.g. test runner choice,
  how to mock the contact form backend, where visual baselines live, CI provider.
- Output a short design doc in `docs/plans/` and wait for my approval.

## Phase 2: Plan (use the writing-plans skill)
- Break the work into small tasks (2–5 minutes each), each with exact file paths,
  the test(s) it adds, and how to verify it.
- Order: test infrastructure and fixtures → functional suite → UI suite →
  CI wiring. Infrastructure must be green before any feature tests.
- Wait for my approval before executing.

## Phase 3: Execute (use subagent-driven development + git worktrees)
- Work in a dedicated worktree/branch, not main.
- One task per subagent, with review between tasks.

### TDD adapted for existing code (important)
The features already exist, so a new test will pass immediately. A test that has
never failed proves nothing. For every test:
1. Write the test.
2. RED: temporarily break the behavior it covers (comment out the handler, break
   the selector, change the status code, remove the aria-label) and confirm the
   test FAILS for the right reason. Show me the failure output.
3. GREEN: revert the break, confirm it passes.
4. Never commit the deliberate break.
If a test can't be made to fail, it's testing nothing. Rewrite it.

If a test fails against the real, unbroken site, that's a real bug. Stop, use the
systematic-debugging skill, report it to me, and do not "fix" the test to match
broken behavior.

## Constraints
- Deterministic: no real network calls to external services in the main suite,
  fixture data instead of live content, animations disabled and fonts loaded
  before screenshots, dynamic regions masked.
- Tag tests `@functional`, `@visual`, `@a11y`. External link checking goes in a
  separate suite that is excluded from the default run.
- Run every test file 3x locally before marking a task done to catch flakiness.
- Precise, minimal code. No speculative abstractions, no helpers used only once.

## Phase 4: Verify and finish
- Use verification-before-completion: full suite green across Chromium, Firefox,
  and WebKit, with actual command output shown. No "should pass" claims.
- Request a code review of the whole branch, address findings.
- Use finishing-a-development-branch and give me a summary: tests added per
  category, real bugs found, plan items skipped and why, and the commands to run
  each suite.

---

# E2E Test Plan (scope)

This file is the source of truth for the scope of the end-to-end suite. It lists what to test and the edge cases for each area. *How* the work is done (brainstorm, plan, worktree, TDD with deliberate breaks) is defined by the task brief, not here.

The suite has two parts:

- **Functional suite:** how the site behaves (routing, navigation, interactions, the contact form, search).
- **UI suite:** how the site looks and adapts (visual regression, responsive layout, theming, accessibility, cross-browser).

External link checking is a third, separate suite that is **not** part of the default run.

Status key: ✅ exists today · 🟡 partial · ⬜ to build

---

## 0. Current state

The scaffold below already exists on `main`. It is a starting point, not a constraint, so the brainstorm phase may replace any of it.

| Item | Location | Notes |
| --- | --- | --- |
| Playwright 1.64 + `@axe-core/playwright` | `package.json` devDependencies | Only Chromium is installed; Firefox and WebKit are not |
| Config | `playwright.config.ts` | `next dev` on port 3100; `desktop` (Desktop Chrome) and `mobile` (Pixel 7) projects; no tags, no visual settings |
| Route smoke tests | `e2e/navigation.spec.ts` | 7 routes render, 404 for an unknown route |
| Accessibility and overflow tests | `e2e/ui.spec.ts` | axe on 3 pages, horizontal overflow, desktop navbar link |
| Scripts | `test:e2e`, `test:e2e:ui` | No per-tag scripts yet |

At the time of writing: 27 pass, 2 fail (the contrast bug in §7), 1 skipped.

---

## 1. Site facts the tests depend on

Check these against the code during brainstorming; if any are wrong, fix this section first.

- **Framework:** Next.js 15 (Turbopack) + Nextra 4 docs theme. Every content page is MDX under `src/content/`, served by the catch-all `src/app/[[...mdxPath]]/page.jsx`.
- **Routes:**
  - `/` (home, assembled from `src/components/sections/*`)
  - `/projects` plus 10 project pages
  - `/blog` plus posts (one blog post exists today)
  - `/portfolio/{about,experience,skills,education}`
  - `/gallery/test`, which is hidden from the sidebar and has pagination disabled; `/gallery` itself returns 404
- **Navigation:** the Nextra navbar has a GitHub link and a LinkedIn link, the `StatusLine` sits under the navbar, and the footer shows the current year. `/projects` uses an explicit `href` in `src/content/_meta.js`, which currently resolves to `/projects/laylocafe` instead of `/projects` (see §7 bug #7).
- **Contact form:**
  - Client: `src/components/sections/Contact.tsx`.
  - API: `POST /api/contact` (`src/app/api/contact/route.ts`), which calls **Resend** using `RESEND_API_KEY`.
  - The API validates in this order: name, email, email format, message, then message length (2000 or fewer characters).
- **Theming:** Nextra's theme switcher (`next-themes`) puts the `dark` class on `<html>` and remembers the choice in `localStorage` under `theme`. The control is the "Change theme" listbox (Light / Dark / System). Colours come from the OKLCH tokens in `globals.css` plus Nextra's `<Head color>` tint scale in `layout.tsx`.
- **Motion:** GSAP (skills marquee, scroll effects) and a Three.js `ParticleSphere` (WebGL canvas) in the hero. `Skills.tsx` and `ParticleSphere.tsx` check `prefers-reduced-motion`.
- **Search:** Pagefind. The index is built only by `npm run build` (the `postbuild` step), so search does not work under `next dev`. The index in `public/_pagefind` is committed to the repo.
- **Non-deterministic content:**
  - The footer year.
  - The Latest Blog date, which `toLocaleDateString` formats differently depending on time zone.
  - The ParticleSphere canvas.
  - The GSAP marquee position.
  - Embla carousel position.

---

## 2. Global constraints

- **Tags:** every test is tagged `@functional`, `@visual`, or `@a11y`. The link checker is tagged `@external`.
- **Default run:** `@functional`, `@visual`, and `@a11y` across Chromium, Firefox, and WebKit. `@external` is excluded (for example with `grepInvert`, or a separate config).
- **No external network:**
  - The main suite never sends a real request to Resend or any third-party host.
  - Block or stub everything that isn't on `localhost`, and fail the test if an unexpected external request is made.
- **Fixture data:**
  - Wherever a test asserts on content, it uses fixtures rather than whatever is currently live.
  - Because content is MDX in the repo, decide during brainstorming between two approaches: (a) a dedicated fixture MDX page or directory that only the tests use, or (b) deriving expectations from the `_meta.js` and front-matter files at test time.
  - The gallery's external images are stubbed rather than fetched live.
- **Screenshot hygiene:**
  - Before each screenshot: set `reducedMotion: 'reduce'`, disable CSS animations (`animations: 'disabled'`), and wait for `document.fonts.ready`.
  - Mask the dynamic regions: footer year, Latest Blog date, ParticleSphere canvas, marquee.
  - Pin `timezoneId` and `locale` in the config.
- **Flakiness:** run every spec file 3 times (`--repeat-each=3`) before calling it done.
- **Minimal code:** no page objects or helpers unless at least two specs use them.

---

## 3. Functional suite (`@functional`)

### 3.1 Routing and rendering

| Case | Edge cases | Status |
| --- | --- | --- |
| Every route in §1 returns < 400, shows `main`/`article`, and throws no `pageerror` | Derive the project and blog lists from `src/content` so new pages are covered automatically | 🟡 7 routes only |
| Unknown route returns 404 | Deep unknown path (`/projects/nope/nope`); trailing slash on a real route | 🟡 |
| `/gallery` is reachable but hidden | Not in the sidebar; no prev/next footer; never shown as "Photo Album" in the blog pagination footer | ⬜ |
| No console errors or hydration warnings | Fail on `console.error` as well as `pageerror` | ⬜ |
| Metadata | `<title>`, `description`, and OpenGraph tags present on `/` | ⬜ |

### 3.2 Navigation

| Case | Edge cases | Status |
| --- | --- | --- |
| Navbar "Projects" goes to `/projects`, not the first project page | Regression guard for the `href` override in `_meta.js` | ✅ (desktop) |
| Navbar Portfolio and Blog links | Active state shown on the current section | ⬜ |
| Mobile menu | Opens, lists all top-level pages, navigates, closes on navigation and on Escape | ⬜ |
| Sidebar on `/portfolio/*` and `/projects/*` | Current page marked `aria-current`; prev/next pagination order matches `_meta.js` | ⬜ |
| GitHub and LinkedIn icons | Correct `href`, open externally (`target`/`rel`), accessible names "GitHub repository" / "LinkedIn profile" | ⬜ |
| Browser back and forward | History works after client-side navigation | ⬜ |
| In-page anchor links (TOC) | Clicking a TOC entry scrolls to the heading and updates the URL hash | ⬜ |

### 3.3 Home page sections

| Case | Edge cases | Status |
| --- | --- | --- |
| Sections present in order | Hero → Differentiator → Projects → Focus → Skills → Latest Blog → Contact | ⬜ |
| Projects carousel | Next/Previous move the slides; Previous is disabled (or a no-op) at the start and Next at the end; keyboard works; each card's `aria-label` "View project: …" links to a page that exists | ⬜ |
| Latest Blog | Shows the newest post by front-matter `date`; a post with no `date` sorts last; the link goes to a real post | ⬜ |
| Resume download | Button "Download Resume" starts a download named `2025Resume.pdf`; the file exists in `public/`; how it hides or shows (`aria-hidden`) as you scroll | ⬜ |
| Reduced motion | With `reducedMotion: 'reduce'`, the marquee and sphere don't animate and no errors are thrown | ⬜ |
| Marquee hover/focus | The skills marquee pauses on hover and on focus | ⬜ |
| WebGL unavailable | The hero survives and still renders if the WebGL context fails (Firefox/WebKit headless may not provide one) | ⬜ |

### 3.4 Contact form, UI layer (API mocked with `page.route`)

| Case | Edge cases | Status |
| --- | --- | --- |
| Empty submit | Each field shows an error; `aria-invalid="true"` and `aria-describedby` point at the message; `role="alert"` summary; **no request sent** | ⬜ |
| Invalid email | `a@b`, `a@b.`, `has space@x.com`, leading or trailing whitespace | ⬜ |
| Message length | Exactly 2000 characters accepted; the textarea's `maxLength={2000}` stops input after 2000 characters, including when pasting | ⬜ |
| Errors clear | Typing in a field clears its error and the summary | ⬜ |
| Pending state | Every input and the submit button are disabled; the loading label shows; double-clicking sends one request | ⬜ |
| Success (mocked 200) | `role="status"` message shown; form reset; message clears after 5 s (`page.clock`) | ⬜ |
| Server error (mocked 500) | Error alert shown; the user's input is preserved; they can resubmit | ⬜ |
| Network failure (`route.abort()`) | Same as 500; no unhandled rejection | ⬜ |
| Request payload | Body sent to `/api/contact` has the expected shape (`name` built from first and last name, `email`, `message`) | ⬜ |
| Keyboard-only submit | Tab through the fields and press Enter to submit | ⬜ |

### 3.5 Contact API, contract layer (`request.post`, no email sent)

Validation fails before Resend is called, so these are safe. Any case that would reach Resend must run with Resend stubbed, for example by starting the test server with a fake `RESEND_API_KEY` and intercepting at the module level. Decide how during brainstorming.

| Case | Edge cases | Status |
| --- | --- | --- |
| Missing `name`, `email`, or `message` | 400 with the matching `field`; empty string treated the same as missing | ⬜ |
| Malformed email | 400, `field: "email"` | ⬜ |
| Message over 2000 characters | 400, `field: "message"`; exactly 2000 passes validation | ⬜ |
| Malformed JSON body | Currently ends up in the `catch` and returns **500**; should probably be 400 (see §7) | ⬜ |
| Wrong method | `GET /api/contact` → 405 | ⬜ |
| Non-string fields | `message: 123` or `message: []` → `.length` and `.replace` behave unexpectedly (see §7) | ⬜ |
| HTML in input | `name: "<img src=x>"` is put into the email HTML without escaping (see §7) | ⬜ |
| Resend failure (stubbed) | Returns 500 with the generic message and doesn't leak error details | ⬜ |
| Resend returns `{ error }` | The route ignores it, so a failed send still returns 200 (see §7 bug #6) | ⬜ |

### 3.6 Search (needs a production build)

| Case | Edge cases | Status |
| --- | --- | --- |
| A known project title returns a result that links to that project | Case-insensitive; partial word | ⬜ |
| No matches | Empty state shown, not an error | ⬜ |
| Keyboard | The search shortcut focuses the input; arrow keys and Enter open a result | ⬜ |
| Code blocks not indexed | `search.codeblocks: false` in `next.config.mjs`, so text that appears only in a code block returns nothing | **N/A** — the content has no fenced code blocks |

Run against `npm run build && npm start`, either as its own Playwright project or with a `@prod` tag. Decide which during brainstorming.

---

## 4. UI suite

### 4.1 Visual regression (`@visual`)

| Case | Edge cases | Status |
| --- | --- | --- |
| Full-page baselines: `/`, `/projects`, one project page, `/blog`, one post, `/portfolio/about` | Phone and desktop only (390×844, 1280×800) × light and dark | ⬜ |
| Component baselines | Hero, project card, contact form in its idle / error / success states, navbar, footer | ⬜ |
| Focus rings | Screenshot of a focused button, link, and input | ⬜ |
| Determinism | Masks and settings from §2; tolerance set with `maxDiffPixelRatio`; baselines generated per browser and OS | ⬜ |

Open decision: where baselines are stored (committed next to the specs, or a separate directory or LFS), and whether CI regenerates them in a pinned Docker image so local macOS baselines don't conflict with Linux CI.

### 4.2 Responsive (`@visual` for screenshots, `@functional` for behaviour)

Viewports: **390×844** (phone), **768×1024** (tablet), **1280×800** (laptop), **1920×1080** (desktop).

| Case | Edge cases | Status |
| --- | --- | --- |
| No horizontal overflow on every route at every viewport | 320 px width as a stress case | 🟡 3 routes, 2 viewports |
| Navbar switches to the mobile menu at the expected breakpoint | Just below and just above the breakpoint | ⬜ |
| Hero height | Fills the viewport minus `STATUS_LINE_HEIGHT_PX` (32) with no gap or overlap | ⬜ |
| Carousel shows the right number of cards per breakpoint | Resize while open | ⬜ |
| Tap targets ≥ 44×44 px on the phone viewport | Carousel arrows, resume button, nav icons | ⬜ |
| Long content | A long project title or a long unbroken URL wraps rather than overflowing | ⬜ |

### 4.3 Theming (`@visual` + `@functional`)

| Case | Edge cases | Status |
| --- | --- | --- |
| Theme switcher cycles light / dark / system | `dark` class on `<html>`; `localStorage.theme` updated | ⬜ |
| Persists across reload and navigation | No flash of the wrong theme on load (screenshot taken immediately after `goto`) | ⬜ |
| Follows the system setting | `colorScheme: 'dark'` with no stored preference → dark | ⬜ |
| Nextra chrome matches the tokens | Sidebar active item, TOC links, search panel, theme dropdown background (`--nextra-bg`) in both themes | ⬜ |

### 4.4 Accessibility (`@a11y`)

| Case | Edge cases | Status |
| --- | --- | --- |
| axe: no serious or critical violations | Every route × light and dark × phone and desktop | 🟡 3 routes, light only, **failing on `/`** |
| Keyboard | Logical tab order; skip link (if any); visible focus everywhere; no focus traps except open dialogs | ⬜ |
| Landmarks and headings | One `h1` per page; heading levels don't skip; `main`, `nav`, `footer` present | ⬜ |
| Images | Every content image has `alt`; decorative SVGs are `aria-hidden` | ⬜ |
| Live regions | The contact form's success and error messages are announced (`role="status"` / `role="alert"`) | ⬜ |
| Reduced motion | Nothing moves on its own when `reducedMotion: 'reduce'` is set | ⬜ |
| `AccessibilityPatches` | Whatever `src/components/ui/AcessibilityPatches.tsx` patches is actually present in the DOM | ⬜ |

### 4.5 Cross-browser

- Every test in §3 and §4 runs on **Chromium, Firefox, and WebKit**. Install them with `npx playwright install firefox webkit`.
- Visual baselines are kept separately for each browser.
- WebKit also covers Safari quirks: `backdrop-filter`, `100dvh`, and font rendering.
- Firefox and WebKit headless may not have WebGL, which is why §3.3 includes the "WebGL unavailable" case.

---

## 5. External link suite (`@external`, not in the default run)

| Case | Edge cases | Status |
| --- | --- | --- |
| Every external `href` on every route returns < 400 | Follow redirects; treat 429 and 403 from LinkedIn as a warning rather than a failure; time out after 10 s | ⬜ |
| Internal links resolve | Every `href` that starts with `/` points to a route that exists (this one could go in the default suite) | ⬜ |

Known external hosts include: `github.com`, `linkedin.com`, `justinklu.com`, `boycott1902.com`, `equaljusticestudios.com`, `laylocafe.com`, `itch.io`, `globalgamejam.org`, `devpost.com`, `riotgames.com`, `aws.amazon.com`, `youtube.com`, and a CloudFront URL.

---

## 6. Scripts and CI

Target scripts (the names can change during brainstorming):

```bash
npm run test:e2e              # default: @functional + @visual + @a11y, all browsers
npm run test:e2e:functional   # --grep @functional
npm run test:e2e:visual       # --grep @visual
npm run test:e2e:a11y         # --grep @a11y
npm run test:e2e:links        # @external only
npm run test:e2e:update       # --update-snapshots
```

CI: the provider isn't decided yet (GitHub Actions is the obvious default). CI should:

- Install browsers with dependencies.
- Run the default suite on every pull request.
- Upload the HTML report and the visual diffs when a test fails.
- Run the `@external` suite on a schedule, not on pull requests.

---

## 7. Known and suspected bugs

These were found while writing this plan. The tests in §3 and §4 should confirm or rule each one out. Do **not** change a test so that it passes against one of these bugs.

| # | Issue | Where | Evidence |
| --- | --- | --- | --- |
| 1 | Colour contrast 3.69:1 (needs 4.5:1) in light mode | `src/components/sections/LatestBlog.tsx:61` (`text-accent-foreground/70`) | Confirmed: axe fails on `/` |
| 2 | User input is put into the email HTML without escaping | `src/app/api/contact/route.ts` (`html:` template) | From reading the code |
| 3 | A malformed JSON body returns 500 instead of 400 | `route.ts`, `request.json()` inside `try` | From reading the code |
| 4 | Non-string `message` isn't type-checked before `.length` / `.replace` | `route.ts` | From reading the code |
| 5 | The Latest Blog date may show one day earlier in time zones west of UTC (date-only strings are parsed as UTC) | `LatestBlog.tsx:36` | **Observed:** home shows "September 3, 2025" for front matter `date: 2025-09-04` under `timezoneId: 'America/New_York'` |
| 6 | The route ignores Resend's `{ error }` response, so a failed send still returns 200 | `src/app/api/contact/route.ts` | From reading the code |
| 7 | The navbar "Projects" link points to `/projects/laylocafe` instead of `/projects` | `src/content/_meta.js` (`href` override) | Confirmed by navigating the site |

---

## 8. Out of scope

- Unit tests for `src/lib` and React components in isolation.
- Load and performance testing (Lighthouse budgets could be a later suite).
- Actually delivering email through Resend.
- Testing the production deployment (Vercel) itself; the suite runs against a local server.
