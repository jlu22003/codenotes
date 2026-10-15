import { test, expect } from '../fixtures'
import { latestPost, pages, sidebarTitles } from '../content'

const navbar = (page: import('@playwright/test').Page) => page.getByRole('banner').getByRole('navigation')

// Same benign abort documented in routing.spec.ts: navigating away mid-flight aborts
// Next.js's in-flight RSC prefetch, which Firefox/WebKit surface as a console.error.
// The router's fallback to a full navigation is correct behavior, not a site defect.
// This file's tests navigate repeatedly (navbar clicks, back/forward, pagination),
// so the same allowance applies file-wide.
test.use({ allowedErrors: [/Failed to fetch RSC payload|_rsc=.*due to access control checks/] })

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

  // The mobile hamburger opens the full sidebar tree (Nextra merges the navbar's
  // page-level links into it on small viewports), not a flat copy of the navbar:
  // "Portfolio"/"Blog" render as disclosure buttons for their already-expanded
  // child pages, never as direct links. "About" (under Portfolio) and the latest
  // post (under Blog) are the real, always-present links in that tree.
  //
  // The closed panel sits off-canvas (negative y-offset), not display:none, so
  // Playwright's `visible` state is always true for its links — toBeInViewport()
  // is the correct check for open vs. closed here.
  test('opens, navigates and closes', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/projects/laylocafe')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    const post = page.getByRole('complementary').getByRole('link', { name: latestPost!.title! })
    await expect(post).toBeInViewport()
    await post.click()
    await expect(page).toHaveURL(/\/blog(\/|$)/)
    await expect(post).not.toBeInViewport()
  })

  test('closes on Escape', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/projects/laylocafe')
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    const about = page.getByRole('link', { name: 'About', exact: true }).first()
    await expect(about).toBeInViewport()
    await page.keyboard.press('Escape')
    await expect(about).not.toBeInViewport()
  })
})

test('sidebar lists projects in _meta.js order', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/projects/laylocafe')
  await expect(page.getByRole('complementary').getByRole('link')).toHaveText(sidebarTitles('projects'))
})

test('pagination follows sidebar order', { tag: '@functional' }, async ({ page }) => {
  const [first, second] = sidebarTitles('projects')
  const route = (title: string) => pages.find((p) => p.title === title)!.route
  // `first` is now the "All Projects" index page, whose own body already links to every
  // project (including `second`) — a plain name match inside `article` also catches that
  // body link. The MDX body always renders inside <main>; Nextra's actual pagination link
  // (nextra-theme-docs/dist/components/pagination.js) renders as a sibling of <main>, never
  // inside it — excluding links with a <main> ancestor isolates the real pagination link.
  const paginationLink = (name: string) =>
    page.getByRole('article').getByRole('link', { name }).filter({ hasNot: page.locator('xpath=ancestor::main') })
  await page.goto(route(first))
  await expect(paginationLink(second)).toHaveAttribute('href', route(second))
  await page.goto(route(second))
  await expect(paginationLink(first)).toHaveAttribute('href', route(first))
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
