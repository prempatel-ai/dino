import { describe, it, expect, beforeEach } from 'vitest';
import { Trex } from '../../src/core/trex';
import { TREX_CONFIG } from '../../src/core/constants';

describe('Trex Physics', () => {
  let trex: Trex;

  beforeEach(() => {
    trex = new Trex();
  });

  it('starts at ground position with standing dimensions', () => {
    expect(trex.x).toBe(TREX_CONFIG.START_X_POS);
    expect(trex.y).toBe(TREX_CONFIG.GROUND_Y_POS);
    expect(trex.w).toBe(TREX_CONFIG.WIDTH);
    expect(trex.h).toBe(TREX_CONFIG.HEIGHT);
    expect(trex.jumping).toBe(false);
    expect(trex.ducking).toBe(false);
  });

  it('full hold jump at speed 6 produces stable apex and air frames', () => {
    trex.startJump(6);
    expect(trex.jumping).toBe(true);

    let apexY = trex.y;
    let airFrames = 0;

    while (trex.jumping) {
      airFrames++;
      trex.updateJump(1);
      if (trex.y < apexY) {
        apexY = trex.y;
      }
    }

    // Record and snapshot apex and airFrames
    expect(apexY).toBeLessThan(TREX_CONFIG.GROUND_Y_POS);
    expect(apexY).toBe(2);
    expect(airFrames).toBe(35);
    expect(trex.y).toBe(TREX_CONFIG.GROUND_Y_POS);
    expect(trex.jumping).toBe(false);
  });

  it('early jump release results in lower jump height (higher y coordinate)', () => {
    // 1. Full hold jump
    const trexFull = new Trex();
    trexFull.startJump(6);
    let fullApexY = trexFull.y;
    for (let f = 0; f < 20; f++) {
      trexFull.updateJump(1);
      if (trexFull.y < fullApexY) fullApexY = trexFull.y;
    }

    // 2. Early release jump: release at frame 5
    const trexShort = new Trex();
    trexShort.startJump(6);
    let shortApexY = trexShort.y;
    for (let f = 0; f < 20; f++) {
      if (f === 5) {
        trexShort.endJump();
      }
      trexShort.updateJump(1);
      if (trexShort.y < shortApexY) shortApexY = trexShort.y;
    }

    // Since Y grows downwards, a lower jump height means shortApexY > fullApexY
    expect(shortApexY).toBeGreaterThan(fullApexY);
  });

  it('speed drop lands significantly faster than normal jump', () => {
    // Normal jump air frames
    const trexNormal = new Trex();
    trexNormal.startJump(6);
    let normalFrames = 0;
    while (trexNormal.jumping) {
      normalFrames++;
      trexNormal.updateJump(1);
    }

    // Speed drop jump air frames (press down after frame 8)
    const trexDrop = new Trex();
    trexDrop.startJump(6);
    let dropFrames = 0;
    while (trexDrop.jumping) {
      dropFrames++;
      if (dropFrames === 8) {
        trexDrop.setSpeedDrop(true);
      }
      trexDrop.updateJump(1);
    }

    expect(dropFrames).toBeLessThan(normalFrames);
  });

  it('ducking on ground changes dimensions to 59x25 and shifts top Y', () => {
    trex.setDuck(true);
    expect(trex.ducking).toBe(true);
    expect(trex.w).toBe(TREX_CONFIG.WIDTH_DUCK);
    expect(trex.h).toBe(TREX_CONFIG.HEIGHT_DUCK);
    expect(trex.y).toBe(115); // 93 + (47 - 25)

    trex.setDuck(false);
    expect(trex.ducking).toBe(false);
    expect(trex.w).toBe(TREX_CONFIG.WIDTH);
    expect(trex.h).toBe(TREX_CONFIG.HEIGHT);
    expect(trex.y).toBe(TREX_CONFIG.GROUND_Y_POS);
  });

  it('ducking in air triggers speed drop and does not change sprite dimensions until landed', () => {
    trex.startJump(6);
    trex.updateJump(1);
    expect(trex.jumping).toBe(true);

    trex.setDuck(true);
    // While in air, dimensions must stay standard standing
    expect(trex.w).toBe(TREX_CONFIG.WIDTH);
    expect(trex.h).toBe(TREX_CONFIG.HEIGHT);
    expect(trex.speedDrop).toBe(true);

    // Complete jump until landing
    while (trex.jumping) {
      trex.updateJump(1);
    }

    // Once landed, ducking becomes active if still held
    expect(trex.ducking).toBe(true);
    expect(trex.w).toBe(TREX_CONFIG.WIDTH_DUCK);
    expect(trex.h).toBe(TREX_CONFIG.HEIGHT_DUCK);
  });

  it('cannot jump while already jumping or ducking', () => {
    trex.startJump(6);
    expect(trex.startJump(6)).toBe(false);

    const trexDuck = new Trex();
    trexDuck.setDuck(true);
    expect(trexDuck.startJump(6)).toBe(false);
  });
});
