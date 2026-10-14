import { test, expect } from '@playwright/test'

const routes = [
  '/',
  '/projects',
  '/blog',
  '/portfolio/about',
  '/portfolio/experience',
  '/portfolio/skills',
  '/portfolio/education',
]

for (const route of routes) {
  test(`${route} renders without errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    const response = await page.goto(route)
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('main, article').first()).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('unknown route returns 404', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
})
