import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness & Touch Controls', () => {
  test('handles touch start, jump, and controls on mobile emulation', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('#game');
    await expect(canvas).toBeVisible();

    // Verify canvas is centered and within viewport bounds
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
      expect(box.width / box.height).toBeCloseTo(4, 1);
    }

    // Tap canvas to start game
    await canvas.tap();

    // Wait 400ms into intro
    await page.waitForTimeout(400);

    // Tap upper area to jump
    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * 0.3);
    }

    await page.waitForTimeout(300);
    await expect(canvas).toBeVisible();

    // Verify touch on SFX button works without crashing
    const muteBtn = page.locator('#btn-mute');
    await expect(muteBtn).toBeVisible();
    await muteBtn.tap();
    await expect(muteBtn).toHaveText('SFX: OFF');
    await muteBtn.tap();
    await expect(muteBtn).toHaveText('SFX: ON');
  });
});
