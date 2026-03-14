import { expect, test } from '@playwright/test'

test.describe('Roadmap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/roadmap')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Roadmap' })).toBeVisible()
  })

  test('shows 18 topic nodes', async ({ page }) => {
    const topicNodes = page.locator('a[href^="/topic/"][data-topic-id]')

    await expect(topicNodes).toHaveCount(18)
  })

  test('shows Arrays & Hashing as first topic', async ({ page }) => {
    await expect(page.locator('a[href="/topic/arrays-hashing"]')).toContainText('Arrays & Hashing')
  })

  test('clicking a node navigates to topic page', async ({ page }) => {
    await page.getByRole('link', { name: /Arrays & Hashing/i }).click()

    await expect(page).toHaveURL(/\/topic\/arrays-hashing$/)
    await expect(page.getByRole('heading', { name: /Arrays & Hashing/i })).toBeVisible()
  })
})
