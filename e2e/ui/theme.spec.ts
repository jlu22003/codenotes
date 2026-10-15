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

test.describe('persistence', () => {
  // This test navigates away mid-load on purpose. WebKit then logs Next's cancelled RSC prefetches and chunk
  // loads, and Next falls back to a full navigation. Only those messages are allowed here.
  test.use({ allowedErrors: [/RSC payload|Failed to load chunk|access control checks/] })

  test('choice survives reload and navigation without a flash', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/')
    await choose(page, 'Dark')
    // Let the home page finish its prefetches, or WebKit logs them as errors when the next navigation cancels them.
    await page.waitForLoadState('networkidle')
    await page.goto('/projects', { waitUntil: 'domcontentloaded' })
    // Not auto-retrying on purpose: the class must already be there at first paint.
    expect(await page.locator('html').getAttribute('class')).toMatch(/\bdark\b/)
    await page.reload({ waitUntil: 'domcontentloaded' })
    expect(await page.locator('html').getAttribute('class')).toMatch(/\bdark\b/)
  })})

test.describe('system preference', () => {
  test.use({ colorScheme: 'dark' })

  test('follows the OS when nothing is stored', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })
})

test('dark theme dropdown matches the page background', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await choose(page, 'Dark')
  await switcher(page).click()
  const [listbox, body] = await page.evaluate(() => {
    // The dropdown is translucent (70%), so paint it over the page colour on an opaque canvas
    // and compare what is actually shown. Reading a translucent colour straight off a canvas rounds differently per browser.
    const ctx = document.createElement('canvas').getContext('2d')!
    const paint = (...layers: string[]) => {
      ctx.clearRect(0, 0, 1, 1)
      for (const layer of layers) {
        ctx.fillStyle = layer
        ctx.fillRect(0, 0, 1, 1)
      }
      return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3))
    }
    const pageColour = getComputedStyle(document.body).backgroundColor
    const list = document.querySelector('[role="listbox"]')!
    return [paint(pageColour, getComputedStyle(list).backgroundColor), paint(pageColour)]
  })
  // Allow 1/255 per channel: the translucent layer's colour-space conversion rounds differently per browser.
  expect(Math.max(...listbox.map((value, i) => Math.abs(value - body[i])))).toBeLessThanOrEqual(1)
})
