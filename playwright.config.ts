import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Desktop
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'desktop-safari',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile Android
    {
      name: 'android-pixel5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'android-galaxy-s9',
      use: { ...devices['Galaxy S9+'] },
    },
    // Mobile iOS
    {
      name: 'ios-iphone14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'ios-iphone14-pro-max',
      use: { ...devices['iPhone 14 Pro Max'] },
    },
    // Tablet
    {
      name: 'tablet-ipad',
      use: { ...devices['iPad Pro'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
