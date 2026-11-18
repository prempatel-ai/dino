import { test, expect } from '@playwright/test';

test('page boots and shows canvas', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('#game');
  await expect(canvas).toBeVisible();
});
