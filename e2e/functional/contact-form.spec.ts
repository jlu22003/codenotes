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

test('keeps a value entered before hydration when another field is edited', { tag: '@functional' }, async ({ context }) => {
  // Fresh page with the app's scripts held back, so the value is set while the
  // form is still server-rendered, then React hydrates and a second field is edited.
  const early = await context.newPage()
  let release!: () => void
  const gate = new Promise<void>((resolve) => (release = resolve))
  await early.route('**/_next/static/**/*.js', async (route) => {
    await gate
    await route.continue()
  })
  await early.goto('/#contact-me', { waitUntil: 'commit' })
  await early.locator('#firstName').evaluate((el: HTMLInputElement) => (el.value = 'Ada'))
  release()
  await waitForHydratedForm(early)
  await early.getByLabel('Last Name', { exact: true }).fill('Lovelace')
  await expect(early.getByLabel('First Name', { exact: true })).toHaveValue('Ada')
  await early.close()
})

test('disables the form while sending and sends once', { tag: '@functional' }, async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => (release = resolve))
  let calls = 0
  await page.route('**/api/contact', async (route) => {
    calls++
    await gate
    await route.fulfill({ json: { message: 'Message sent successfully' } })
  })
  await fill(page, valid)
  const button = page.getByRole('button', { name: 'Submit Contact Form' })
  await button.click()
  await expect(button).toBeDisabled()
  await expect(button).toHaveText('Sending...')
  for (const label of FIELDS) await expect(page.getByLabel(label, { exact: true })).toBeDisabled()
  await button.click({ force: true })
  release()
  await expect(page.getByRole('status')).toBeVisible()
  expect(calls).toBe(1)
})

test('success message resets the form and clears after 5 seconds', { tag: '@functional' }, async ({ page }) => {
  await page.clock.install()
  await page.goto('/#contact-me')
  await waitForHydratedForm(page)
  await countApiCalls(page)
  await fill(page, valid)
  await submit(page)
  await expect(page.getByRole('status')).toContainText('Message sent successfully!')
  for (const label of FIELDS) await expect(page.getByLabel(label, { exact: true })).toHaveValue('')
  await page.clock.fastForward(5000)
  await expect(page.getByRole('status')).toHaveCount(0)
})

test.describe('failures', () => {
  test.use({ allowedErrors: [/Contact form error/] })

  test('server error keeps input and allows resubmitting', { tag: '@functional' }, async ({ page }) => {
    let fail = true
    await page.route('**/api/contact', (route) =>
      fail
        ? route.fulfill({ status: 500, json: { error: 'Failed to send message. Please try again.' } })
        : route.fulfill({ json: { message: 'Message sent successfully' } }),
    )
    await fill(page, valid)
    await submit(page)
    await expect(contactAlert(page)).toContainText('Failed to send message. Please try again.')
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Hello')
    fail = false
    await submit(page)
    await expect(page.getByRole('status')).toContainText('Message sent successfully!')
  })

  test('network failure shows an error and keeps input', { tag: '@functional' }, async ({ page }) => {
    await page.route('**/api/contact', (route) => route.abort('failed'))
    await fill(page, valid)
    await submit(page)
    await expect(contactAlert(page)).toContainText('Failed to send message')
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue('ada@example.com')
  })
})

test('can be completed with the keyboard alone', { tag: '@functional' }, async ({ page, browserName }) => {
  // macOS WebKit's Tab skips buttons by default; Alt+Tab is its "focus any control" key.
  const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  const calls = await countApiCalls(page)
  await page.getByLabel('First Name', { exact: true }).focus()
  for (const value of ['Ada', 'Lovelace', 'ada@example.com', 'Hello']) {
    await page.keyboard.type(value)
    await page.keyboard.press(tab)
  }
  await expect(page.getByRole('button', { name: 'Submit Contact Form' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toBeVisible()
  expect(calls).toHaveLength(1)
})
