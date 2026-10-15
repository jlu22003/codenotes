import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 3100)
const RESEND_PORT = Number(process.env.E2E_RESEND_PORT ?? 3201)
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/external/**'],
  fullyParallel: true,
  // Set only by e2e/docker.sh: amd64 emulation on Apple silicon is several times slower than native.
  ...(process.env.E2E_EMULATED ? { timeout: 120_000, workers: 2 } : {}),
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  grepInvert: process.env.E2E_DOCKER ? /@external/ : /@external|@visual/,
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  expect: {
    ...(process.env.E2E_EMULATED ? { timeout: 30_000 } : {}),
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
      reuseExistingServer: !!process.env.E2E_REUSE,
      env: { E2E_RESEND_PORT: String(RESEND_PORT) },
    },
    {
      command: `npm run build && npx next start -p ${PORT}`,
      url: baseURL,
      // Never reuse by default: a server started outside Playwright could be holding the
      // real RESEND_API_KEY from .env.local and send real email. E2E_REUSE=1 is only
      // for servers started by `npm run test:e2e:serve` (fake email env).
      reuseExistingServer: !!process.env.E2E_REUSE,
      // amd64 emulation on Apple silicon builds far slower than native.
      timeout: process.env.E2E_EMULATED ? 1_200_000 : 300_000,
      // Real environment variables win over .env.local in Next.js.
      env: {
        RESEND_BASE_URL: `http://localhost:${RESEND_PORT}`,
        RESEND_API_KEY: 're_fake_e2e',
        TZ: 'America/New_York',
      },
    },
  ],
})
