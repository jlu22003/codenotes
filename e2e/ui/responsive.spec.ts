import { test, expect } from '../fixtures'
import { routes } from '../content'

const VIEWPORTS = {
  narrow: { width: 320, height: 640 },
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
}

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(name, () => {
    test.use({ viewport })
    // Known Next.js RSC prefetch-abort noise from navigating every route back to back on Firefox/WebKit.
    test.use({ allowedErrors: [/Failed to fetch RSC payload|_rsc=.*due to access control checks/] })

    test('no route scrolls horizontally', { tag: '@functional' }, async ({ page }) => {
      const overflowing: string[] = []
      for (const route of routes) {
        await page.goto(route)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        if (overflow > 0) overflowing.push(`${route} (+${overflow}px)`)
      }
      expect(overflowing).toEqual([])
    })
  })
}

for (const [width, mobile] of [[767, true], [768, false]] as const) {
  test(`navbar at ${width}px uses the ${mobile ? 'mobile menu' : 'inline links'}`, { tag: '@functional' }, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible({ visible: mobile })
    await expect(page.getByRole('banner').getByRole('link', { name: 'Portfolio', exact: true })).toBeVisible({ visible: !mobile })
  })
}

test('hero fills the first screen', { tag: '@functional' }, async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.laptop)
  await page.goto('/')
  const hero = page.locator('section', { has: page.locator('#particle-sphere-background') })
  const box = (await hero.boundingBox())!
  expect(Math.abs(box.y + box.height - VIEWPORTS.laptop.height)).toBeLessThanOrEqual(1)
})

test.describe('phone', () => {
  test.use({ viewport: VIEWPORTS.phone })

  test('shows one full project card at a time', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/')
    await page.locator('#projects').scrollIntoViewIfNeeded()
    // The group is the carousel slide, whose 16px left padding is clipped by the carousel by design; the link is the visible card.
    // ratio 0.99 absorbs WebKit's sub-pixel rounding.
    const card = (n: number) => page.getByRole('group', { name: new RegExp(`^${n} of `) }).getByRole('link')
    await expect(card(1)).toBeInViewport({ ratio: 0.99 })
    await expect(card(2)).not.toBeInViewport({ ratio: 0.99 })
  })

  test('tap targets are at least 44×44', { tag: '@functional' }, async ({ page }) => {
    await page.goto('/')
    const small: string[] = []
    for (const name of ['Menu', 'Previous Projects', 'Next Projects', 'Download Resume']) {
      const box = (await page.getByRole('button', { name, exact: true }).boundingBox())!
      if (box.width < 44 || box.height < 44) small.push(`${name} ${box.width}×${box.height}`)
    }
    expect(small).toEqual([])
  })
})
