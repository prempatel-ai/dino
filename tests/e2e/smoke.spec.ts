import { test, expect } from '@playwright/test';

test.describe('Dino Runner Smoke Test', () => {
  test('boots, starts on space, progresses, and renders', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('#game');
    await expect(canvas).toBeVisible();

    // Verify 4:1 aspect ratio
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const ratio = box.width / box.height;
      expect(ratio).toBeCloseTo(4, 1);
    }

    // Press Space to start game
    await page.keyboard.press('Space');

    // Wait 500 ms for intro and running
    await page.waitForTimeout(500);

    // Press jump
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);

    // Verify game is still alive and rendering
    await expect(canvas).toBeVisible();
  });
});
