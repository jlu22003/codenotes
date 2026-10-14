import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const pages = ['/', '/projects', '/portfolio/about']

for (const route of pages) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page }).analyze()
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })

  test(`${route} has no horizontal overflow`, async ({ page }) => {
    await page.goto(route)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('navbar links navigate', async ({ page, isMobile }) => {
  test.skip(isMobile, 'navbar collapses into a menu on mobile')
  await page.goto('/')
  await page.getByRole('navigation').getByRole('link', { name: /projects/i }).first().click()
  await expect(page).toHaveURL(/\/projects/)
})
