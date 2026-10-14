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

  // The Hero section fills ~100dvh, so the carousel starts below the fold;
  // scroll it into view before asserting on it (this is a test-setup
  // concern, not product behavior under test).
  await first.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await expect(next).toBeEnabled() // carousel hydrated
  await expect(previous).toBeDisabled()
  // ratio 1 is unreachable here: CarouselContent's embla spacing trick
  // (`-ml-4` on the track, `pl-4` on each item) puts ~16px of the first
  // item's own left padding outside the track's clip region on every
  // browser (measured ~96.5%) — that's inert padding, not clipped content.
  await expect(first).toBeInViewport({ ratio: 0.95 })

  await next.focus()
  await page.keyboard.press('Enter')
  await expect(previous).toBeEnabled()
  // ratio: 1 here would be vacuous — the first slide never reaches ratio 1
  // (see above), so that assertion would pass even if scrollNext() did
  // nothing. Use the same reachable threshold so this actually proves the
  // slide scrolled away.
  await expect(first).not.toBeInViewport({ ratio: 0.95 })

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

test.describe('hero particle sphere', () => {
  test.use({ reducedMotion: 'reduce' })

  // Calibration (chromium, 1280x800, right-half of #particle-sphere-background
  // minus the heading/paragraph/buttons/resume-button bounding boxes, each
  // padded 24px): per-pixel luminance diff vs the resolved --background color,
  // share of pixels with diff > 8 —
  //   dark (known-good):      ~0.0077
  //   light, fresh load:      ~0.0094 (already correct — color resolves once, at mount, to the then-current theme)
  //   light, switched from dark: ~0.0049 (the bug — stale dark-theme color painted over a light background)
  // MINIMUM_SHARE sits between the broken and healthy values, closer to the
  // broken one so a real (not just marginal) recolor failure trips it.
  //
  // Firefox was measured too (same methodology) and separates the same way
  // chromium does — switched ~0.0049 vs dark ~0.0077 / fresh-light ~0.0099 —
  // so MINIMUM_SHARE=0.006 works there as well. WebKit doesn't: its
  // "switched" share (~0.0105) sits close to its own "dark" share (~0.0136)
  // — only ~23% lower, vs chromium/firefox's ~36-50% drop — so a single
  // fixed minimum can't reliably fail the bug on WebKit without also failing
  // the already-correct fresh-light case on chromium/firefox. This is
  // engine-specific WebGL/canvas anti-aliasing variance, not part of the bug
  // under test, so only WebKit is skipped.
  const THRESHOLD = 8
  const MINIMUM_SHARE = 0.006

  test('is visible in light theme', { tag: '@functional' }, async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'threshold not reliable on WebKit — see comment above')

    async function measureVisibleShare() {
      await expect(page.locator('#particle-sphere-background canvas')).toBeVisible()

      const el = page.locator('#particle-sphere-background')
      const elBox = (await el.boundingBox())!

      // Exclude the hero's text block and the fixed resume button (both can
      // overlap the element's bounding box) so only sphere/background pixels
      // are sampled — padded 24px for anti-aliased edges.
      const margin = 24
      const exclusions = (
        await Promise.all(
          [
            page.getByRole('heading', { level: 1 }),
            page.getByText('Software Engineer', { exact: false }),
            page.getByRole('link', { name: 'View Work' }),
            page.getByRole('link', { name: 'Contact Me' }),
            page.getByRole('button', { name: 'Download Resume' }),
          ].map(async (locator) => {
            const box = await locator.boundingBox()
            if (!box) return null
            return { x: box.x - margin, y: box.y - margin, width: box.width + margin * 2, height: box.height + margin * 2 }
          }),
        )
      ).filter((box): box is { x: number; y: number; width: number; height: number } => box !== null)

      const buf = await el.screenshot()
      const dataUrl = `data:image/png;base64,${buf.toString('base64')}`

      return page.evaluate(
        async ({ url, elBox, exclusions, threshold }) => {
          // Resolve the page background the same way ParticleSphere resolves
          // the dot color: rasterize the CSS var to a 1x1 canvas and read the
          // pixel back, since getComputedStyle's color-string format isn't
          // reliable across browsers for oklch()/etc.
          const probe = document.createElement('div')
          probe.style.color = 'var(--background)'
          document.body.appendChild(probe)
          const computed = getComputedStyle(probe).color
          document.body.removeChild(probe)
          const bgCanvas = document.createElement('canvas')
          bgCanvas.width = 1
          bgCanvas.height = 1
          const bgCtx = bgCanvas.getContext('2d')!
          bgCtx.fillStyle = computed
          bgCtx.fillRect(0, 0, 1, 1)
          const [br, bg, bb] = bgCtx.getImageData(0, 0, 1, 1).data
          const bgLum = 0.2126 * br + 0.7152 * bg + 0.0722 * bb

          // Decode the element screenshot via an in-page canvas — no image
          // library needed.
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = url
          })
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

          const inExclusion = (vx: number, vy: number) =>
            exclusions.some((r) => vx >= r.x && vx <= r.x + r.width && vy >= r.y && vy <= r.y + r.height)

          // Right half only — away from the hero's radial scrim, which is
          // centered at 25%/78% of the section and fades out by 75% of its
          // ellipse radius.
          const startX = Math.floor(canvas.width / 2)
          let lit = 0
          let total = 0
          for (let y = 0; y < canvas.height; y++) {
            for (let x = startX; x < canvas.width; x++) {
              const vx = elBox.x + x
              const vy = elBox.y + y
              if (inExclusion(vx, vy)) continue
              const i = (y * canvas.width + x) * 4
              const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
              if (Math.abs(lum - bgLum) > threshold) lit++
              total++
            }
          }
          return lit / total
        },
        { url: dataUrl, elBox, exclusions, threshold: THRESHOLD },
      )
    }

    await test.step('fresh load with light theme stored', async () => {
      await page.addInitScript(() => localStorage.setItem('theme', 'light'))
      await page.goto('/')
      expect(await measureVisibleShare()).toBeGreaterThanOrEqual(MINIMUM_SHARE)
    })

    await test.step('load dark then switch to Light via the theme switcher', async () => {
      // Registers after the 'light' script above — init scripts run in
      // registration order, so this one (setting 'dark') runs second and
      // wins on this next goto.
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
      await page.goto('/')
      await expect(page.locator('#particle-sphere-background canvas')).toBeVisible()
      await page.locator('button[title="Change theme"]:visible').first().click()
      await page.getByRole('option', { name: 'Light' }).click()
      // The MutationObserver callback (post-fix) and its render() call land
      // asynchronously relative to the click; poll instead of a fixed frame
      // count so this doesn't race the paint on slower/jittery runs.
      await expect.poll(() => measureVisibleShare(), { timeout: 5_000 }).toBeGreaterThanOrEqual(MINIMUM_SHARE)
    })
  })
})
