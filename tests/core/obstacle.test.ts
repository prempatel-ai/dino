import { describe, it, expect } from 'vitest';
import { Obstacle } from '../../src/core/obstacle';
import { OBSTACLE_TYPES, RUNNER_CONFIG } from '../../src/core/constants';
import { RNG } from '../../src/core/rng';

describe('Obstacle Logic', () => {
  it('calculates gap formula correctly for 3 speeds', () => {
    const rng = new RNG(123);
    const smallCactus = OBSTACLE_TYPES.CACTUS_SMALL;
    const width = smallCactus.width; // 17
    const coef = RUNNER_CONFIG.GAP_COEFFICIENT; // 0.6
    const minGapBase = smallCactus.minGap; // 120

    const speeds = [6, 9.5, 13];
    for (const speed of speeds) {
      const expectedMinGap = Math.round(width * speed + minGapBase * coef);
      const expectedMaxGap = Math.round(expectedMinGap * RUNNER_CONFIG.MAX_GAP_COEFFICIENT);

      const calculatedGap = Obstacle.getGap(width, minGapBase, coef, speed, rng);
      expect(calculatedGap).toBeGreaterThanOrEqual(expectedMinGap);
      expect(calculatedGap).toBeLessThanOrEqual(expectedMaxGap);
    }
  });

  it('enforces multipleSpeed rule for obstacle groups', () => {
    // Large cactus multipleSpeed is 7. At speed 6, size must be 1.
    const rng = new RNG(42);
    for (let i = 0; i < 30; i++) {
      const obstacle = Obstacle.create('CACTUS_LARGE', 6, rng);
      expect(obstacle.size).toBe(1);
      expect(obstacle.w).toBe(OBSTACLE_TYPES.CACTUS_LARGE.width);
    }

    // At speed 10 (>= 7), size can be 1, 2, or 3
    let observedMultiSize = false;
    for (let i = 0; i < 50; i++) {
      const obstacle = Obstacle.create('CACTUS_LARGE', 10, rng);
      if (obstacle.size > 1) {
        observedMultiSize = true;
        break;
      }
    }
    expect(observedMultiSize).toBe(true);
  });

  it('correctly configures multi-unit cactus collision boxes', () => {
    const rng = new RNG(100);
    const multiCactus = new Obstacle(OBSTACLE_TYPES.CACTUS_SMALL, 3, 6, rng);
    expect(multiCactus.w).toBe(17 * 3); // 51
    expect(multiCactus.collisionBoxes.length).toBe(3);

    const b0 = multiCactus.collisionBoxes[0];
    const b1 = multiCactus.collisionBoxes[1];
    const b2 = multiCactus.collisionBoxes[2];

    expect(b0.w).toBe(5);
    expect(b1.w).toBe(51 - 5 - 7); // 39
    expect(b2.x).toBe(51 - 7); // 44
    expect(b2.w).toBe(7);
  });

  it('configures pterodactyl attributes and flap animation', () => {
    const rng = new RNG(777);
    const ptero = Obstacle.create('PTERODACTYL', 9, rng);

    expect(ptero.type).toBe('PTERODACTYL');
    expect([100, 75, 50]).toContain(ptero.y);
    expect(Math.abs(ptero.speedOffset)).toBe(0.8);

    // Initial frame
    expect(ptero.frame).toBe(0);

    // After 10 frames, anim alternates
    ptero.update(9, 10);
    expect(ptero.frame).toBe(1);
    ptero.update(9, 10);
    expect(ptero.frame).toBe(0);
  });
});
