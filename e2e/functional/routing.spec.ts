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

test.describe('internal link crawl', () => {
  // Navigating away mid-crawl aborts Next.js's in-flight RSC prefetches; Firefox/WebKit
  // surface that as either a console.error ("Failed to fetch RSC payload...") from Next's
  // own catch block, or a pageerror whose .message WebKit truncates to
  // "<url>?_rsc=... due to access control checks." (the full sentence, "Fetch API cannot
  // load ... due to access control checks.", only shows up in .stack, not .message).
  // Chromium shows neither. Both are the same benign abort; the router's fallback to a
  // full browser navigation is correct behavior, not a site defect. Anchored to `_rsc=`
  // so a genuine CORS/CSP-blocked fetch during the crawl still fails the test.
  test.use({ allowedErrors: [/Failed to fetch RSC payload|_rsc=.*due to access control checks/] })

  test('every internal link resolves', { tag: '@functional' }, async ({ page, request }) => {
    test.setTimeout(120_000)
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
})

test('home has title and social metadata', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/\S/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Justin Lu Portfolio')
})
