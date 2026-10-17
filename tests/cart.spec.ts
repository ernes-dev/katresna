import { test, expect } from '@playwright/test'

test.describe('Cart', () => {
  test('empty cart shows message', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(/Keranjang kosong/i)).toBeVisible({ timeout: 10000 })
  })

  test('empty cart has link back to menu', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('a', { hasText: /Lihat Menu/i })).toBeVisible({ timeout: 10000 })
  })

  test('cart page header visible', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(/Keranjang Belanja/i)).toBeVisible({ timeout: 10000 })
  })

  test('cart page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/cart')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 2)
  })

  test('back arrow exists on cart page', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForLoadState('domcontentloaded')
    const backBtn = page.locator('a[href="/"]').first()
    await expect(backBtn).toBeVisible({ timeout: 10000 })
  })
})
