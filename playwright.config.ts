import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 3100)
const RESEND_PORT = Number(process.env.E2E_RESEND_PORT ?? 3201)
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/external/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  grepInvert: process.env.E2E_DOCKER ? /@external/ : /@external|@visual/,
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL,
    timezoneId: 'America/New_York',
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'node e2e/fake-resend.mjs',
      url: `http://localhost:${RESEND_PORT}`,
      reuseExistingServer: false,
      env: { E2E_RESEND_PORT: String(RESEND_PORT) },
    },
    {
      command: `npm run build && npx next start -p ${PORT}`,
      url: baseURL,
      // Never reuse: a server started outside Playwright could be holding the
      // real RESEND_API_KEY from .env.local and send real email.
      reuseExistingServer: false,
      timeout: 300_000,
      // Real environment variables win over .env.local in Next.js.
      env: {
        RESEND_BASE_URL: `http://localhost:${RESEND_PORT}`,
        RESEND_API_KEY: 're_fake_e2e',
        TZ: 'America/New_York',
      },
    },
  ],
})
