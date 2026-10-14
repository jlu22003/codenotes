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
