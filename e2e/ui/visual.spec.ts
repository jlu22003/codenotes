import { test, expect } from '../fixtures'
import type { Page } from '@playwright/test'
import { latestPost, pages, sidebarTitles } from '../content'

test.skip(({ browserName }) => browserName !== 'chromium', 'Visual baselines are Chromium-only')
test.skip(!process.env.E2E_DOCKER, 'Baselines are Linux-only: run npm run test:e2e:docker')
test.use({ reducedMotion: 'reduce' })

// Index 0 is "All Projects"; the first real project is index 1.
const project = pages.find((p) => p.title === sidebarTitles('projects')[1])!.route
const FULL_PAGES = ['/', '/projects', project, '/blog', latestPost!.route, '/portfolio/about']
const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1920, height: 1080 },
}

async function settle(page: Page, route: string, theme: 'light' | 'dark') {
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
  await page.goto(route)
  await page.evaluate(async () => {
    await document.fonts.ready
    const images = Array.from(document.images)
    images.forEach((img) => (img.loading = 'eager'))
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)))
  })
}

const dynamic = (page: Page) => [
  page.getByRole('contentinfo'), // copyright year
  page.locator('time'), // "Last updated on"
  page.locator('#particle-sphere-background'),
  page.locator('#latest-blog-heading + p'), // post date
]

for (const route of FULL_PAGES) {
  for (const theme of ['light', 'dark'] as const) {
    for (const size of ['phone', 'desktop'] as const) {
      test(`${route} ${theme} ${size}`, { tag: '@visual' }, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS[size])
        await settle(page, route, theme)
        await expect(page).toHaveScreenshot(`${route.replaceAll('/', '_') || '_home'}-${theme}-${size}.png`, {
          fullPage: true,
          mask: dynamic(page),
        })
      })
    }
  }
}

for (const [size, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`components ${size}`, () => {
    test.use({ viewport })

    test('hero, project card, navbar', { tag: '@visual' }, async ({ page }) => {
      await settle(page, '/', 'light')
      const hero = page.locator('section', { has: page.locator('#particle-sphere-background') })
      await expect(hero).toHaveScreenshot(`hero-${size}.png`, { mask: dynamic(page) })
      await expect(page.getByRole('group', { name: /^1 of / })).toHaveScreenshot(`project-card-${size}.png`)
      await expect(page.getByRole('banner')).toHaveScreenshot(`navbar-${size}.png`)
    })

    test('contact form states', { tag: '@visual' }, async ({ page }) => {
      await page.route('**/api/contact', (route) => route.fulfill({ json: { message: 'ok' } }))
      await settle(page, '/', 'light')
      const card = page.locator('#contact-me form').locator('xpath=ancestor::*[contains(@class,"rounded")][1]')
      await expect(card).toHaveScreenshot(`contact-idle-${size}.png`)
      await page.getByRole('button', { name: 'Submit Contact Form' }).click()
      await expect(card).toHaveScreenshot(`contact-error-${size}.png`)
      for (const [label, value] of [['First Name', 'Ada'], ['Last Name', 'Lovelace'], ['Email', 'ada@example.com'], ['Message', 'Hello']]) {
        await page.getByLabel(label, { exact: true }).fill(value)
      }
      await page.getByRole('button', { name: 'Submit Contact Form' }).click()
      await expect(page.getByRole('status')).toBeVisible()
      await expect(card).toHaveScreenshot(`contact-success-${size}.png`)
    })
  })
}

test('focus rings', { tag: '@visual' }, async ({ page }) => {
  await settle(page, '/', 'light')
  for (const [name, target] of [
    ['button', page.getByRole('button', { name: 'Submit Contact Form' })],
    ['link', page.getByRole('link', { name: 'View All Projects' })],
    ['input', page.getByLabel('First Name', { exact: true })],
  ] as const) {
    await target.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab') // keyboard focus, so :focus-visible applies
    // Padded clip: the focus ring is drawn outside the element's box, so an element-only crop hides it.
    const box = (await target.boundingBox())!
    const pad = 8
    await expect(page).toHaveScreenshot(`focus-${name}.png`, {
      clip: { x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad },
    })
  }
})
