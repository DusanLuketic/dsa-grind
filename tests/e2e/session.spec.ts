import { expect, test } from '@playwright/test'

test.describe('Session Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/session')
  })

  test('page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Study Session' })).toBeVisible()
  })

  test('shows Pomodoro timer with 25:00', async ({ page }) => {
    await expect(page.getByText('25:00')).toBeVisible()
  })

  test('Start button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
  })

  test('timer counts down when started', async ({ page }) => {
    const timer = page.locator('.tabular-nums').first()

    await expect(timer).toHaveText('25:00')
    await page.getByRole('button', { name: 'Start' }).click()

    await expect.poll(async () => (await timer.textContent())?.trim(), {
      timeout: 5000,
    }).not.toBe('25:00')
  })

  test('Reset button restores 25:00', async ({ page }) => {
    const timer = page.locator('.tabular-nums').first()

    await page.getByRole('button', { name: 'Start' }).click()
    await expect.poll(async () => (await timer.textContent())?.trim(), {
      timeout: 5000,
    }).not.toBe('25:00')

    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(timer).toHaveText('25:00')
  })

  test('shows daily goal section', async ({ page }) => {
    await expect(page.getByText('Daily Goal')).toBeVisible()
    await expect(page.getByText('problems today')).toBeVisible()
  })
})
