import { test, expect } from '@playwright/test'

// These tests override viewport — only run on desktop/android projects
// iOS WebKit device emulation conflicts with setViewportSize
const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'Android Pixel 7', width: 412, height: 915 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop 1280', width: 1280, height: 800 },
  { name: 'Desktop 1440', width: 1440, height: 900 },
]

test.skip(({ browserName }) => browserName === 'webkit', 'Skip setViewportSize on WebKit — tested via dedicated iOS project')

for (const viewport of VIEWPORTS) {
  test(`${viewport.name} (${viewport.width}px) — homepage no overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
    expect(overflow, `${viewport.name} homepage horizontal overflow`).toBe(false)
  })

  test(`${viewport.name} (${viewport.width}px) — cart no overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/cart')
    await page.waitForLoadState('domcontentloaded')
    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
    expect(overflow, `${viewport.name} cart horizontal overflow`).toBe(false)
  })
}
