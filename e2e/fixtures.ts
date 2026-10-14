import { test as base, expect } from '@playwright/test'

const STUBBED_HOSTS = ['images.react-photo-album.com']
export const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

export const test = base.extend<{ allowedErrors: RegExp[]; guard: void }>({
  allowedErrors: [[], { option: true }],
  guard: [
    async ({ page, allowedErrors }, use) => {
      const blocked: string[] = []
      const errors: string[] = []

      await page.route(
        (url) => url.hostname !== 'localhost',
        (route) => {
          const url = new URL(route.request().url())
          if (STUBBED_HOSTS.includes(url.hostname)) {
            return route.fulfill({ contentType: 'image/png', body: PIXEL })
          }
          blocked.push(url.href)
          return route.abort('blockedbyclient')
        },
      )
      page.on('pageerror', (error) => {
        if (!allowedErrors.some((pattern) => pattern.test(error.message))) errors.push(error.message)
      })
      page.on('console', (message) => {
        const text = message.text()
        // Failed HTTP statuses (404 pages, mocked 500s) are asserted by the tests themselves.
        if (message.type() !== 'error' || text.startsWith('Failed to load resource')) return
        if (!allowedErrors.some((pattern) => pattern.test(text))) errors.push(text)
      })

      await use()

      expect(blocked, 'unexpected external requests').toEqual([])
      expect(errors, 'page errors').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
