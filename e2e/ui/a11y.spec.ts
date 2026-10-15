import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '../fixtures'
import { routes } from '../content'

test.describe('per-route', () => {
  // Next.js RSC prefetches abort on Firefox/WebKit when the test navigates away.
  test.use({ allowedErrors: [/Failed to fetch RSC payload|_rsc=.*due to access control checks/] })
for (const route of routes) {
  test(`${route} has no serious axe violations`, { tag: '@a11y' }, async ({ page }) => {
    const found: string[] = []
    for (const theme of ['light', 'dark']) {
      for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
        await page.setViewportSize(viewport)
        await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
        await page.goto(route)
        // Let late font downloads finish so the next navigation does not abort one (Firefox logs that as an error).
        await page.waitForLoadState('networkidle')
        await page.evaluate(() => document.fonts.ready)
        // Nextra's search <kbd> has transition-all; axe must not sample a colour mid-fade.
        await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' })
        const { violations } = await new AxeBuilder({ page }).analyze()
        for (const v of violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')) {
          found.push(`${theme} ${viewport.width}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
        }
      }
    }
    expect(found).toEqual([])
  })

  test(`${route} has one h1, ordered headings and landmarks`, { tag: '@a11y' }, async ({ page }) => {
    await page.goto(route)
    await expect(page.locator('h1')).toHaveCount(1)
    const levels = await page.locator('main :is(h1,h2,h3,h4,h5,h6)').evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])))
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], `heading ${i} skips a level`).toBeLessThanOrEqual(levels[i - 1] + 1)
    }
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('banner').getByRole('navigation')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.locator('main img:not([alt])')).toHaveCount(0)
    await expect(page.locator('main svg:not([aria-hidden="true"]):not([role="img"])')).toHaveCount(0)
  })
}
})

test('keyboard reaches key controls with a visible focus ring', { tag: '@a11y' }, async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit only tabs to links with Option+Tab')
  await page.goto('/')
  const reached: string[] = []
  const noRing: string[] = []
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      if (el === document.body) return null // Tab wrapped past the last control
      const style = getComputedStyle(el)
      const name = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? el.tagName
      return { name, ring: style.outlineStyle !== 'none' || style.boxShadow !== 'none' }
    })
    if (!info) continue
    reached.push(info.name)
    if (!info.ring) noRing.push(info.name)
  }
  const order = ['Skip to Content', 'Portfolio', 'Next Projects', 'Submit Contact Form']
  const positions = order.map((name) => reached.indexOf(name))
  expect(positions, `reached: ${reached.join(' | ')}`).not.toContain(-1)
  expect(positions).toEqual([...positions].sort((a, b) => a - b))
  expect(noRing).toEqual([])
})

test('AccessibilityPatches labels and sizes icon-only listbox buttons', { tag: '@a11y' }, async ({ page }) => {
  await page.goto('/projects/laylocafe')
  const buttons = page.locator('button[aria-haspopup="listbox"]:visible')
  await expect(buttons.first()).toBeVisible()
  for (const button of await buttons.all()) {
    await expect(button).toHaveAttribute('aria-label', /\S/)
    const box = (await button.boundingBox())!
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(48)
  }
})
