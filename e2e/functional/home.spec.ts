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
