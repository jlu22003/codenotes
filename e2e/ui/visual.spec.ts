import { test, expect } from '../fixtures'
import type { Page } from '@playwright/test'
import { latestPost, pages, sidebarTitles } from '../content'

test.skip(({ browserName }) => browserName !== 'chromium', 'Visual baselines are Chromium-only')
test.skip(!process.env.E2E_DOCKER, 'Baselines are linux/amd64-only: run in CI or npm run test:e2e:visual')
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
  // Skills renders a marquee first and swaps to a taller wrapped list once it reads prefers-reduced-motion
  // after hydration (every shot here uses reducedMotion), so the page height is not final until it is gone.
  await expect(page.getByRole('group', { name: /Focus to pause/ })).toHaveCount(0)
  await page.evaluate(async () => {
    await document.fonts.ready
    const images = Array.from(document.images)
    images.forEach((img) => (img.loading = 'eager'))
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)))
  })
  await page.addStyleTag({ content: HIDE_SPHERE })
}

// The animated sphere fills the hero, so it is hidden rather than masked to keep the hero text in the comparison.
const HIDE_SPHERE = '#particle-sphere-background { visibility: hidden !important; }'

const dynamic = (page: Page) => [
  page.getByRole('contentinfo'), // copyright year
  page.locator('time'), // "Last updated on"
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
      // The success banner clears itself after 5s; take the clock before the page loads so timing is controlled.
      await page.clock.install()
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
    const wrapperId = `focus-screenshot-${name}`
    await target.evaluate((element, id) => {
      const wrapper = document.createElement('span')
      wrapper.dataset.focusScreenshot = id
      wrapper.style.cssText = 'position: fixed; top: 8px; left: 8px; display: inline-block; padding: 8px; line-height: 0; background: transparent; z-index: 2147483647;'
      element.parentElement!.insertBefore(wrapper, element)
      wrapper.appendChild(element)
    }, wrapperId)
    const wrapper = page.locator(`[data-focus-screenshot="${wrapperId}"]`)
    const box = (await wrapper.boundingBox())!
    await expect(page).toHaveScreenshot(`focus-${name}.png`, {
      animations: 'disabled',
      clip: { x: 0, y: 0, width: box.width + 16, height: box.height + 16 },
      scale: 'css',
    })
    await page.locator(`[data-focus-screenshot="${wrapperId}"]`).evaluate((wrapper) => {
      const element = wrapper.firstElementChild!
      wrapper.parentElement!.insertBefore(element, wrapper)
      wrapper.remove()
    }).catch(() => undefined)
  }
})
