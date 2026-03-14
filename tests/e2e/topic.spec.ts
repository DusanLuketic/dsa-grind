import { expect, test } from '@playwright/test'

test.describe('Topic Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/topic/arrays-hashing')
  })

  test('shows topic title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Arrays & Hashing/i })).toBeVisible()
  })

  test('shows problems in table', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Two Sum' })).toBeVisible()
  })

  test('shows problem count', async ({ page }) => {
    await expect(page.getByText('0/9 solved')).toBeVisible()
  })

  test('problem links go to problem page', async ({ page }) => {
    await page.getByRole('link', { name: 'Two Sum' }).click()

    await expect(page).toHaveURL(/\/problem\/two-sum$/)
  })

  test('difficulty filters work', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Medium' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Hard' })).toBeVisible()

    await page.getByRole('button', { name: 'Easy' }).click()
    await expect(page.getByRole('link', { name: 'Two Sum' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Group Anagrams' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Hard' }).click()
    await expect(page.getByRole('link', { name: 'Two Sum' })).toHaveCount(0)
    await expect(page.getByText('No problems match the current filters')).toBeVisible()
  })

  test('returns 404 for invalid topic slug', async ({ page }) => {
    await page.goto('/topic/nonexistent-topic')

    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Page not found')).toBeVisible()
  })
})
