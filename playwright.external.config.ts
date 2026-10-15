import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/external',
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 120_000,
  use: { baseURL: 'https://www.justinklu.com' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
