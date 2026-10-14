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

test.describe('fake resend', () => {
  test('site sends through the fake, never the real API', { tag: '@functional' }, async ({ request }, testInfo) => {
    const name = `Infra ${testInfo.testId}-${testInfo.repeatEachIndex}`
    const response = await request.post('/api/contact', {
      data: { name, email: 'infra@example.com', message: 'hello' },
    })
    expect(response.status()).toBe(200)

    const sent = await (await request.get(`http://localhost:3201/__sent?match=${encodeURIComponent(name)}`)).json()
    expect(sent).toHaveLength(1)
    expect(sent[0].subject).toBe(`Portfolio Contact from ${name}`)
  })

  // Hits the fake server's /emails endpoint directly, the way the Resend SDK does, rather than
  // through /api/contact: the route never inspects resend.emails.send()'s return value (it
  // ignores the SDK's { error } shape, see Task 13 bug #6), so a response forwarded through the
  // site would always read back 200 regardless of the fake's matching logic.
  test('returns a queued response only to the matching sender', { tag: '@functional' }, async ({ request }, testInfo) => {
    const name = `Queued ${testInfo.testId}-${testInfo.repeatEachIndex}`
    await request.post('http://localhost:3201/__next', {
      data: { match: name, status: 422, body: { name: 'validation_error', message: 'bad', statusCode: 422 } },
    })

    const other = await request.post('http://localhost:3201/emails', {
      data: { subject: `Portfolio Contact from Other ${testInfo.testId}-${testInfo.repeatEachIndex}` },
    })
    expect(other.status()).toBe(200)

    const matching = await request.post('http://localhost:3201/emails', {
      data: { subject: `Portfolio Contact from ${name}` },
    })
    expect(matching.status()).toBe(422)
  })
})
