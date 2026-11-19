import { defineConfig, devices } from '@playwright/test'

// Some sites (YouTube, from CI runners) send response headers larger than
// Node's 16 KiB default, which fails the request with "Parse Error: Header
// overflow" before any status is read. Raise the limit for the workers, which
// inherit this env, so the link check still sees the real status code and a
// dead link still fails.
process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--max-http-header-size=262144'].filter(Boolean).join(' ')

export default defineConfig({
  testDir: './e2e/external',
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 120_000,
  use: { baseURL: 'https://www.justinklu.com' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
