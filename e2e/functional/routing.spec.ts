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

test('home has title and social metadata', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/\S/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Justin Lu Portfolio')
})
