import { test, expect, FAKE_RESEND } from '../fixtures'
import type { APIRequestContext, TestInfo } from '@playwright/test'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello' }
const FIELD_IN_RESPONSE = { name: 'firstName', email: 'email', message: 'message' } as const

for (const field of ['name', 'email', 'message'] as const) {
  for (const value of [undefined, '']) {
    test(`${field} ${value === undefined ? 'missing' : 'empty'} → 400`, { tag: '@functional' }, async ({ request }) => {
      const response = await request.post('/api/contact', { data: { ...valid, [field]: value } })
      expect(response.status()).toBe(400)
      expect((await response.json()).field).toBe(FIELD_IN_RESPONSE[field])
    })
  }
}

test('malformed email → 400', { tag: '@functional' }, async ({ request }) => {
  const response = await request.post('/api/contact', { data: { ...valid, email: 'not-an-email' } })
  expect(response.status()).toBe(400)
  expect((await response.json()).field).toBe('email')
})

test('message over 2000 characters → 400', { tag: '@functional' }, async ({ request }) => {
  const response = await request.post('/api/contact', { data: { ...valid, message: 'x'.repeat(2001) } })
  expect(response.status()).toBe(400)
  expect((await response.json()).field).toBe('message')
})

test('GET is not allowed', { tag: '@functional' }, async ({ request }) => {
  expect((await request.get('/api/contact')).status()).toBe(405)
})

test('malformed JSON → 400', { tag: '@functional' }, async ({ request }) => {
  // regression: request.json() used to throw inside the try and return 500.
  // Note: `data` must be a Buffer here, not a string — Playwright JSON-serializes
  // a plain string into a quoted JSON value (`"{not json"`), which is valid JSON
  // and never reaches the malformed-body path. A Buffer is sent as raw bytes.
  const response = await request.post('/api/contact', {
    headers: { 'content-type': 'application/json' },
    data: Buffer.from('{not json'),
  })
  expect(response.status()).toBe(400)
})

for (const field of ['name', 'email', 'message'] as const) {
  for (const value of [123, ['x']]) {
    test(`non-string ${field} ${JSON.stringify(value)} → 400`, { tag: '@functional' }, async ({ request }) => {
      // regression: no type check used to make .replace throw and return 500.
      const response = await request.post('/api/contact', { data: { ...valid, [field]: value } })
      expect(response.status()).toBe(400)
      expect((await response.json()).field).toBe(FIELD_IN_RESPONSE[field])
    })
  }
}

const sender = (testInfo: TestInfo) => `Api ${testInfo.testId}-${testInfo.repeatEachIndex}`
const sentTo = async (request: APIRequestContext, name: string) =>
  (await request.get(`${FAKE_RESEND}/__sent?match=${encodeURIComponent(name)}`)).json()

test('valid message is delivered to Resend', { tag: '@functional' }, async ({ request }, testInfo) => {
  const name = sender(testInfo)
  const response = await request.post('/api/contact', { data: { ...valid, name, message: 'x'.repeat(2000) } })
  expect(response.status()).toBe(200)
  const [email] = await sentTo(request, name)
  expect(email.subject).toBe(`Portfolio Contact from ${name}`)
  expect([email.reply_to, email.replyTo].flat()).toContain(valid.email)
})

test('Resend error is reported as a failure', { tag: '@functional' }, async ({ request }, testInfo) => {
  // regression: the SDK returns { error } instead of throwing; the route used to ignore it.
  const name = sender(testInfo)
  await request.post(`${FAKE_RESEND}/__next`, {
    data: { match: name, status: 422, body: { name: 'validation_error', message: 'secret detail', statusCode: 422 } },
  })
  const response = await request.post('/api/contact', { data: { ...valid, name } })
  expect(response.status()).toBe(500)
  const body = await response.json()
  expect(body).toEqual({ error: 'Failed to send message. Please try again.' })
})

test('message HTML is escaped in the email', { tag: '@functional' }, async ({ request }, testInfo) => {
  // regression: user input used to be interpolated into the HTML unescaped.
  const name = sender(testInfo)
  await request.post('/api/contact', { data: { ...valid, name, message: '<img src=x onerror=alert(1)>' } })
  const [email] = await sentTo(request, name)
  expect(email.html).not.toContain('<img src=x')
  expect(email.html).toContain('&lt;img src=x')
})

test('name HTML is escaped in the email', { tag: '@functional' }, async ({ request }, testInfo) => {
  const id = sender(testInfo)
  await request.post('/api/contact', { data: { ...valid, name: `${id} <b>x</b>` } })
  const [email] = await sentTo(request, id)
  expect(email.html).not.toContain('<b>')
  expect(email.html).toContain('&lt;b&gt;')
})
