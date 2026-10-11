import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:5173',
    trace: process.env.E2E_DISABLE_ARTIFACTS === 'true' ? 'off' : 'retain-on-failure',
    screenshot: process.env.E2E_DISABLE_ARTIFACTS === 'true' ? 'off' : 'only-on-failure',
    video: process.env.E2E_DISABLE_ARTIFACTS === 'true' ? 'off' : 'retain-on-failure',
  },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  }],
})
