import { expect, test } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/DSA Grind/)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('shows stat cards', async ({ page }) => {
    await expect(page.getByText('Total Solved')).toBeVisible()
    await expect(page.getByText('By Difficulty')).toBeVisible()
    await expect(page.getByText('Avg Time')).toBeVisible()
    await expect(page.getByText('Completion')).toBeVisible()
  })

  test('shows topic progress section', async ({ page }) => {
    await expect(page.getByText('Topic Progress')).toBeVisible()

    const topicLinks = page.locator('a[href^="/topic/"]')
    await expect(topicLinks).toHaveCount(18)
    await expect(page.locator('a[href="/topic/arrays-hashing"]').first()).toBeVisible()
  })

  test('shows recommended problems section', async ({ page }) => {
    await expect(page.getByText('Recommended Next')).toBeVisible()

    const problemLinks = page.locator('a[href^="/problem/"]')
    await expect(problemLinks.first()).toBeVisible()
  })

  test('has export button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export json/i })).toBeVisible()
  })
})
