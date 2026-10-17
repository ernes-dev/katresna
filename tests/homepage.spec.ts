import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads and shows store info', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('header').getByText('Katresna')).toBeVisible()
  })

  test('shows navigation header with cart', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByRole('link', { name: /keranjang/i })).toBeVisible()
  })

  test('shows store hero card', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText(/Bolen Pisang Khas Bandung/i)).toBeVisible()
  })

  test('shows category tabs', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByRole('button', { name: /Semua/i })).toBeVisible()
  })

  test('category filter works', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const bolenTab = page.getByRole('button', { name: /^Bolen/i })
    if (await bolenTab.isVisible()) {
      await bolenTab.click()
      await expect(bolenTab).toHaveClass(/bg-brand/)
    }
  })

  test('no horizontal overflow on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('header')).toBeVisible()
    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  })

  test('no horizontal overflow on tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('header')).toBeVisible()
    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  })

  test('no horizontal overflow on desktop (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  })
})
