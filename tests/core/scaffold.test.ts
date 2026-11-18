import { describe, it, expect } from 'vitest';
import { RNG } from '../../src/core/rng';
import { RUNNER_CONFIG, TREX_CONFIG } from '../../src/core/constants';

describe('Scaffold & Constants', () => {
  it('loads constants correctly', () => {
    expect(RUNNER_CONFIG.WIDTH).toBe(600);
    expect(RUNNER_CONFIG.HEIGHT).toBe(150);
    expect(TREX_CONFIG.GROUND_Y_POS).toBe(93);
  });

  it('generates deterministic pseudorandom numbers', () => {
    const rng1 = new RNG(42);
    const rng2 = new RNG(42);

    const nums1 = [rng1.next(), rng1.next(), rng1.int(1, 10)];
    const nums2 = [rng2.next(), rng2.next(), rng2.int(1, 10)];

    expect(nums1).toEqual(nums2);
  });
});
