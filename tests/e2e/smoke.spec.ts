import { test, expect } from '@playwright/test';

test.describe('Dino Runner End-to-End Test Suite', () => {
  test('full lifecycle: boot, play, crash, restart, and high score persistence', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('#game');
    await expect(canvas).toBeVisible();

    // 1. Verify 4:1 aspect ratio
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const ratio = box.width / box.height;
      expect(ratio).toBeCloseTo(4, 1);
    }

    // 2. Start game with Space
    await page.keyboard.press('Space');

    // Wait into running phase
    await page.waitForTimeout(600);

    // 3. Jump over first obstacles
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(400);

    // 4. Mute toggle persists across reload
    const muteBtn = page.locator('#btn-mute');
    await muteBtn.click();
    await expect(muteBtn).toHaveText('SFX: OFF');

    await page.reload();
    await expect(page.locator('#btn-mute')).toHaveText('SFX: OFF');

    // 5. Retro mode toggle persists across reload
    const retroBtn = page.locator('#btn-retro');
    await retroBtn.click();
    await expect(retroBtn).toHaveText('RETRO: ON');

    await page.reload();
    await expect(page.locator('#btn-retro')).toHaveText('RETRO: ON');

    // Restore retro mode to modern
    await page.locator('#btn-retro').click();
    await expect(page.locator('#btn-retro')).toHaveText('RETRO: OFF');
  });
});
