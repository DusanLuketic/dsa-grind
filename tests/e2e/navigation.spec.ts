import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
  test('sidebar has 5 navigation links', async ({ page }) => {
    await page.goto('/')

    const navLinks = page.locator('aside nav a')
    await expect(navLinks).toHaveCount(5)
    await expect(navLinks.nth(0)).toHaveAttribute('href', '/')
    await expect(navLinks.nth(4)).toHaveAttribute('href', '/session')
  })

  test('clicking Roadmap navigates to /roadmap', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Roadmap' }).click()

    await expect(page).toHaveURL(/\/roadmap$/)
    await expect(page.getByRole('heading', { name: 'Roadmap' })).toBeVisible()
  })

  test('clicking Resources navigates to /resources', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Resources' }).click()

    await expect(page).toHaveURL(/\/resources$/)
    await expect(page.getByRole('heading', { name: 'Resources' })).toBeVisible()
  })

  test('breadcrumbs show on topic page', async ({ page }) => {
    await page.goto('/topic/arrays-hashing')

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb).toContainText('Dashboard')
    await expect(breadcrumb).toContainText('Topics')
    await expect(breadcrumb).toContainText('Arrays Hashing')
  })
})
