import { expect, test } from '@playwright/test'

test.describe('Problem Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/problem/two-sum')
  })

  test('shows problem title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Two Sum' })).toBeVisible()
  })

  test('shows difficulty badge', async ({ page }) => {
    await expect(page.getByText('EASY')).toBeVisible()
  })

  test('shows LeetCode link', async ({ page }) => {
    const link = page.getByRole('link', { name: /Open on LeetCode/i })

    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', /leetcode\.com\/problems\/two-sum/)
  })

  test('shows YouTube video', async ({ page }) => {
    const iframe = page.locator('iframe[src*="youtube-nocookie.com/embed/"]')

    await expect(iframe).toHaveCount(1)
    await expect(iframe).toBeVisible()
  })

  test('shows timer controls', async ({ page }) => {
    await expect(page.getByText('Timer')).toBeVisible()
    await expect(page.getByText('00:00')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeVisible()
  })

  test('shows prev and next navigation', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Valid Anagram/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Group Anagrams/i })).toBeVisible()
  })
})
