import { test, expect } from './fixtures'

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
