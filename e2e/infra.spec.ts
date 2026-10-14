import { test, expect, PIXEL } from './fixtures'
import { execSync } from 'node:child_process'
import { latestPost, pages, routes, sidebarTitles } from './content'

test.describe('network guard', () => {
  test('fails a test that requests an external host', { tag: '@functional' }, async ({ page }) => {
    test.fail()
    await page.goto('/')
    await page.evaluate(() => fetch('https://example.com/').catch(() => undefined))
  })

  test('stubs gallery images instead of fetching them', { tag: '@functional' }, async ({ page }) => {
    const stubbedResponse = page.waitForResponse((res) => new URL(res.url()).hostname === 'images.react-photo-album.com')
    await page.goto('/gallery/test')
    const response = await stubbedResponse
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/png')
    expect(await response.body()).toEqual(PIXEL)
  })
})

test.describe('error collection', () => {
  test('fails a test whose page throws', { tag: '@functional' }, async ({ page }) => {
    test.fail()
    await page.goto('/')
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('boom')
      })
    })
    await page.waitForEvent('pageerror')
  })

  test.describe('with allowedErrors', () => {
    test.use({ allowedErrors: [/expected noise/] })

    test('ignores console errors the test allows', { tag: '@functional' }, async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => console.error('expected noise'))
    })
  })
})

test.describe('content source', () => {
  test('maps every mdx file to a route', { tag: '@functional' }, () => {
    const mdxFiles = execSync('find src/content -mindepth 2 -name "*.mdx"').toString().trim().split('\n')
    expect(pages).toHaveLength(mdxFiles.length)
    expect(routes).toContain('/projects/laylocafe')
    expect(routes).toContain('/gallery/test')
  })

  test('marks pages hidden in _meta.js as hidden from nav', { tag: '@functional' }, () => {
    const hidden = pages.filter((page) => page.hiddenFromNav).map((page) => page.route)
    expect(hidden).toEqual(expect.arrayContaining(['/projects/securechatapp', '/gallery/test']))
    expect(hidden).not.toContain('/projects/laylocafe')
  })

  test('lists sidebar titles in _meta.js order', { tag: '@functional' }, () => {
    expect(sidebarTitles('projects')[0]).toBe('Laylo Cafe')
    expect(sidebarTitles('projects')).not.toContain(undefined)
  })

  test('finds the newest dated blog post', { tag: '@functional' }, () => {
    expect(latestPost?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
