import { test, expect } from '../fixtures'
import { pages, sidebarTitles } from '../content'
import type { Page } from '@playwright/test'

// `sidebarTitles('projects')[0]` is the "All Projects" index page, now the
// first visible sidebar entry. [1] is the first real project ("Laylo Cafe").
const title = sidebarTitles('projects')[1]
const route = pages.find((page) => page.title === title)!.route
const query = title.slice(0, 4).toLowerCase() // partial and different case

// Pagefind's client code dynamically imports the search module (and its wasm)
// on the first keystroke of every page load, instead of bundling it. Under
// parallel browser load that first import can run past the default 5s
// assertion timeout, so these first-result assertions get extra headroom.
const SEARCH_TIMEOUT = 15_000

// The search box is server-rendered before React hydrates it. A fill() that
// lands in that window can be silently discarded when hydration mounts and
// resets the controlled input back to its initial (empty) value — same race
// documented in contact-form.spec.ts's safeFill. Retry until it sticks.
async function searchFor(page: Page, value: string) {
  const input = page.getByRole('combobox', { name: 'Search...' })
  await expect(async () => {
    await input.fill(value)
    await expect(input).toHaveValue(value)
  }).toPass()
}

test('finds a project by partial, case-insensitive title', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await searchFor(page, query)
  const result = page.getByRole('option').filter({ hasText: title }).first()
  await expect(result).toBeVisible({ timeout: SEARCH_TIMEOUT })
  await result.click()
  await expect(page).toHaveURL(new RegExp(`${route}(#.*)?$`))
})

test('shows an empty state for no matches', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await searchFor(page, 'zqxjvw')
  await expect(page.getByText('No results found.')).toBeVisible({ timeout: SEARCH_TIMEOUT })
})

test('works from the keyboard', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  // Nextra's shortcut picks Meta vs Ctrl off `navigator.userAgent`, not the
  // host OS. Playwright's Desktop Chrome/Firefox device profiles report a
  // Windows UA (only Desktop Safari reports Mac), so `ControlOrMeta` — which
  // resolves off the actual host OS — sends the wrong modifier on those two.
  // Mirror the product's own check instead of assuming a host-OS modifier.
  const isMac = await page.evaluate(() => navigator.userAgent.includes('Mac'))
  await page.keyboard.press(isMac ? 'Meta+k' : 'Control+k')
  await expect(page.getByRole('combobox', { name: 'Search...' })).toBeFocused()
  await page.keyboard.type(query)
  await expect(page.getByRole('option').first()).toBeVisible({ timeout: SEARCH_TIMEOUT })
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page).not.toHaveURL('/')
})
