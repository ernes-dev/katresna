import { test, expect } from '@playwright/test'

test.describe('Admin Login', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByPlaceholder(/seller@katresna/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible()
  })

  test('shows error on wrong credentials', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Supabase auth slower on WebKit — tested on Chromium/Firefox')
    test.setTimeout(60000)
    await page.goto('/admin/login')
    await page.waitForLoadState('domcontentloaded')
    await page.locator('input[type="email"]').fill('wrong@email.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText(/Email atau password salah/i)).toBeVisible({ timeout: 30000 })
  })

  test('login page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/admin/login')
    await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible()
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 2)
  })
})

test.describe('Admin redirect', () => {
  test('/admin redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('/admin/dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
