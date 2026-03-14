import { expect, test } from '@playwright/test'

test.describe('Stats Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stats')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible()
  })

  test('shows empty state or chart components', async ({ page }) => {
    const emptyState = page.getByText(/No stats yet|solve your first problem/i)
    const charts = page.locator('.recharts-wrapper, svg[aria-label="Activity heatmap showing daily coding activity over the past year"]')

    await expect.poll(async () => {
      const hasCharts = (await charts.count()) > 0
      const hasEmpty = (await emptyState.count()) > 0

      return hasCharts || hasEmpty
    }).toBe(true)
  })
})
