import { test, expect } from '../fixtures'
import { publishedRoutes, routes } from '../content'

const SITE_URL = 'https://www.justinklu.com'
const absolute = (route: string) => (route === '/' ? SITE_URL : `${SITE_URL}${route}`)

test('home title leads with the name', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Justin K. Lu · Software Engineer')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Justin K. Lu · Software Engineer')
})

for (const route of routes) {
  test(`${route} has its own title, canonical URL and link preview`, { tag: '@functional' }, async ({ page }) => {
    await page.goto(route)
    if (route !== '/') await expect(page).toHaveTitle(/^\S.* · Justin K\. Lu$/)
    const title = await page.title()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', absolute(route))
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', absolute(route))
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title)
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Justin K. Lu')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE_URL}/opengraph-image`)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /\/opengraph-image/)
  })
}

test('home describes the owner as a schema.org Person', { tag: '@functional' }, async ({ page }) => {
  await page.goto('/')
  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)
  expect(jsonLd).toEqual({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Justin K. Lu',
    jobTitle: 'Software Engineer',
    url: SITE_URL,
    sameAs: ['https://github.com/jlu22003', 'https://www.linkedin.com/in/justin-lu-jkl/'],
  })
})

test('sitemap lists exactly the published pages', { tag: '@functional' }, async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  const locs = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  expect(locs.sort()).toEqual(publishedRoutes.map(absolute).sort())
})

test('robots.txt allows crawling and points at the sitemap', { tag: '@functional' }, async ({ request }) => {
  const response = await request.get('/robots.txt')
  expect(response.status()).toBe(200)
  const body = await response.text()
  expect(body).toMatch(/^User-Agent: \*$/m)
  expect(body).toMatch(/^Allow: \/$/m)
  expect(body).not.toMatch(/^Disallow:/m)
  expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
})

test('link-preview image is a 1200x630 PNG', { tag: '@functional' }, async ({ request }) => {
  const response = await request.get('/opengraph-image')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toBe('image/png')
  const png = await response.body()
  // IHDR: width and height are the big-endian uint32s at bytes 16 and 20.
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
})
