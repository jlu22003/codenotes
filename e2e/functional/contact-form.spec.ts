import { test, expect } from '../fixtures'
import type { Page } from '@playwright/test'

const FIELDS = ['First Name', 'Last Name', 'Email', 'Message'] as const

async function countApiCalls(page: Page) {
  const calls: unknown[] = []
  await page.route('**/api/contact', (route) => {
    calls.push(route.request().postDataJSON())
    return route.fulfill({ json: { message: 'Message sent successfully' } })
  })
  return calls
}

async function fill(page: Page, values: Partial<Record<(typeof FIELDS)[number], string>>) {
  for (const [label, value] of Object.entries(values)) await page.getByLabel(label, { exact: true }).fill(value)
}

const valid = { 'First Name': 'Ada', 'Last Name': 'Lovelace', Email: 'ada@example.com', Message: 'Hello' }
const submit = (page: Page) => page.getByRole('button', { name: 'Submit Contact Form' }).click()

// The form is server-rendered before React hydrates it. Investigated (see
// task-10-report.md): a write that lands in that window is NOT wiped by
// hydration itself landing — but React's onChange for it can be missed
// (the event fires before React's delegated listener attaches), leaving
// React's state for that field at its initial "" even though the DOM still
// shows the typed value. handleChange merges over that stale state
// (`setFormData((prev) => ({...prev, [name]: value}))`), so the *next*
// field's edit re-renders the whole form from it, forcing the controlled
// input's DOM value back to "" and silently wiping what was typed. This is
// a real product bug (reported BLOCKED), not a test artifact to retry
// around. These tests check validation, not hydration, so avoid the window
// entirely: wait for React to have actually attached to the DOM — a
// deterministic signal, not a fixed delay — before any test touches the form.
async function waitForHydratedForm(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const el = document.getElementById('firstName')
        return !!el && Object.keys(el).some((key) => key.startsWith('__reactProps$'))
      }),
    )
    .toBe(true)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/#contact-me')
  await waitForHydratedForm(page)
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
  await message.fill('x'.repeat(2000))
  await message.press('x')
  await expect(message).toHaveValue('x'.repeat(2000))
})

test('editing a field clears its error and the summary', { tag: '@functional' }, async ({ page }) => {
  await submit(page)
  const firstName = page.getByLabel('First Name', { exact: true })
  await firstName.fill('Ada')
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
