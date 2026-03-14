import { expect, test } from '@playwright/test'

test.describe('Resources Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resources')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Resources' })).toBeVisible()
  })

  test('shows 17 resources in 4 sections', async ({ page }) => {
    await expect(page.locator('section h2')).toHaveCount(4)
    await expect(page.getByRole('link', { name: /^Visit$/ }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /^Visit$/ })).toHaveCount(17)
  })

  test('shows expected section headings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'YouTube Channels' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tools' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Books & Articles' })).toBeVisible()
  })

  test('shows NeetCode resource', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'NeetCode', exact: true })).toBeVisible()
  })

  test('resource links open in new tab', async ({ page }) => {
    const firstLink = page.getByRole('link', { name: /^Visit$/ }).first()

    await expect(firstLink).toHaveAttribute('target', '_blank')
  })
})
