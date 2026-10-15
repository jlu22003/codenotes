// Imports Playwright directly: the e2e fixture blocks external hosts, which is what this suite checks.
import { test, expect } from '@playwright/test'
import { routes } from '../content'

const SOFT_FAIL = [403, 429, 999] // bot walls (LinkedIn returns 999)

test('every external link on the live site responds', { tag: '@external' }, async ({ page, request }) => {
  const links = new Set<string>()
  for (const route of routes) {
    await page.goto(route)
    for (const href of await page.locator('a[href^="http"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))) {
      if (!href.startsWith('https://www.justinklu.com')) links.add(href)
    }
  }
  const broken: string[] = []
  for (const url of links) {
    const response = await request.get(url, { timeout: 10_000, maxRedirects: 5 }).catch((e: Error) => e)
    if (response instanceof Error) broken.push(`${url} (${response.message.split('\n')[0]})`)
    else if (SOFT_FAIL.includes(response.status())) test.info().annotations.push({ type: 'warning', description: `${url} → ${response.status()}` })
    else if (response.status() >= 400) broken.push(`${url} → ${response.status()}`)
  }
  expect(broken).toEqual([])
})
