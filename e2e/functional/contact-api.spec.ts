import { test, expect } from '../fixtures'

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
  // ⚠ expected bug #3: request.json() throws inside try and the catch returns 500.
  // Note: `data` must be a Buffer here, not a string — Playwright JSON-serializes
  // a plain string into a quoted JSON value (`"{not json"`), which is valid JSON
  // and never reaches the malformed-body path. A Buffer is sent as raw bytes.
  const response = await request.post('/api/contact', {
    headers: { 'content-type': 'application/json' },
    data: Buffer.from('{not json'),
  })
  expect(response.status()).toBe(400)
})

for (const message of [123, ['x']]) {
  test(`non-string message ${JSON.stringify(message)} → 400`, { tag: '@functional' }, async ({ request }) => {
    // ⚠ expected bug #4: no type check, so .replace throws and the catch returns 500.
    const response = await request.post('/api/contact', { data: { ...valid, message } })
    expect(response.status()).toBe(400)
    expect((await response.json()).field).toBe('message')
  })
}
