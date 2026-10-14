import { test, expect } from '../fixtures'
import type { Locator, Page } from '@playwright/test'

const FIELDS = ['First Name', 'Last Name', 'Email', 'Message'] as const

async function countApiCalls(page: Page) {
  const calls: unknown[] = []
  await page.route('**/api/contact', (route) => {
    calls.push(route.request().postDataJSON())
    return route.fulfill({ json: { message: 'Message sent successfully' } })
  })
  return calls
}

// The form is server-rendered before React hydrates it. A fill() that lands
// in that window can be silently discarded when hydration mounts and resets
// the controlled input back to its initial (empty) value — observed on
// webkit, where the field touched first sometimes reads empty again by the
// time of submit even though it read back correctly right after filling.
// Retrying the fill itself isn't enough, since the reset can land *after*
// that immediate read-back. So fill every field, then make a second pass
// that re-fills anything hydration knocked back out once it's settled.
async function safeFill(field: Locator, value: string) {
  await expect(async () => {
    await field.fill(value)
    await expect(field).toHaveValue(value)
  }).toPass()
}

async function fill(page: Page, values: Partial<Record<(typeof FIELDS)[number], string>>) {
  const entries = Object.entries(values)
  for (const [label, value] of entries) await safeFill(page.getByLabel(label, { exact: true }), value)
  for (const [label, value] of entries) await safeFill(page.getByLabel(label, { exact: true }), value)
}

const valid = { 'First Name': 'Ada', 'Last Name': 'Lovelace', Email: 'ada@example.com', Message: 'Hello' }
const submit = (page: Page) => page.getByRole('button', { name: 'Submit Contact Form' }).click()

test.beforeEach(async ({ page }) => {
  await page.goto('/#contact-me')
})

// Next.js's App Router portals a hidden `role="alert"` live region onto
// `document.body` for route announcements, so an unscoped `getByRole('alert')`
// matches it too. Scope to the form's own section to see only its alert.
const contactAlert = (page: Page) => page.locator('#contact-me').getByRole('alert')

test('empty submit flags every field and sends nothing', { tag: '@functional' }, async ({ page }) => {
  const calls = await countApiCalls(page)
  await submit(page)
  await expect(contactAlert(page)).toContainText('Please fix the highlighted fields below.')
  for (const label of FIELDS) {
    const field = page.getByLabel(label, { exact: true })
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    const describedBy = await field.getAttribute('aria-describedby')
    await expect(page.locator(`#${describedBy}`)).toBeVisible()
  }
  expect(calls).toHaveLength(0)
})

for (const email of ['a@b', 'a@b.', 'has space@x.com']) {
  test(`rejects invalid email "${email}"`, { tag: '@functional' }, async ({ page }) => {
    const calls = await countApiCalls(page)
    await fill(page, { ...valid, Email: email })
    await submit(page)
    await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('#email-error')).toHaveText('Enter a valid email address.')
    expect(calls).toHaveLength(0)
  })
}

test('message stops at 2000 characters', { tag: '@functional' }, async ({ page }) => {
  const message = page.getByLabel('Message', { exact: true })
  await safeFill(message, 'x'.repeat(2000))
  await message.press('x')
  await expect(message).toHaveValue('x'.repeat(2000))
})

test('editing a field clears its error and the summary', { tag: '@functional' }, async ({ page }) => {
  await submit(page)
  const firstName = page.getByLabel('First Name', { exact: true })
  await safeFill(firstName, 'Ada')
  await expect(firstName).toHaveAttribute('aria-invalid', 'false')
  await expect(contactAlert(page)).toHaveCount(0)
})

test('sends the expected payload', { tag: '@functional' }, async ({ page }) => {
  const calls = await countApiCalls(page)
  await fill(page, valid)
  await submit(page)
  await expect(page.getByRole('status')).toContainText('Message sent successfully!')
  expect(calls).toEqual([{ name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello' }])
})
