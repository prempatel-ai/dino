import { describe, it, expect } from 'vitest';
import { Horizon } from '../../src/core/horizon';
import { RNG } from '../../src/core/rng';

describe('Horizon & Spawning Logic', () => {
  it('does not spawn any obstacles during the first 3000 ms (180 frames at 60 fps)', () => {
    const rng = new RNG(12345);
    const horizon = new Horizon(rng);

    // Run for 179 frames (approx 2983 ms)
    for (let f = 0; f < 179; f++) {
      horizon.update(6, 1);
      expect(horizon.obstacles.length).toBe(0);
    }

    // Advance 2 frames to cross 3000 ms
    horizon.update(6, 2);
    expect(horizon.obstacles.length).toBeGreaterThan(0);
  });

  it('never spawns pterodactyl when speed is below 8.5', () => {
    const rng = new RNG(999);
    const horizon = new Horizon(rng);

    // Run for 1000 frames at speed 6
    for (let f = 0; f < 1000; f++) {
      horizon.update(6, 1);
    }

    const pteroSpawned = horizon.obstacleHistory.some((t) => t === 'PTERODACTYL');
    expect(pteroSpawned).toBe(false);
  });

  it('spawns pterodactyl when speed is 8.5 or higher', () => {
    const rng = new RNG(456);
    const horizon = new Horizon(rng);

    // Run for 3000 frames at speed 9
    for (let f = 0; f < 3000; f++) {
      horizon.update(9, 1);
    }

    const pteroSpawned = horizon.obstacleHistory.some((t) => t === 'PTERODACTYL');
    expect(pteroSpawned).toBe(true);
  });

  it('never spawns more than 2 of the same obstacle type in a row', () => {
    const rng = new RNG(2024);
    const horizon = new Horizon(rng);

    // Simulate 5000 frames at speed 10
    for (let f = 0; f < 5000; f++) {
      horizon.update(10, 1);
    }

    // Inspect obstacle history: ensure no 3 identical consecutive types
    const history = horizon.obstacleHistory;
    expect(history.length).toBeGreaterThan(10);

    for (let i = 2; i < history.length; i++) {
      const triple = history[i] === history[i - 1] && history[i - 1] === history[i - 2];
      expect(triple).toBe(false);
    }
  });

  it('removes obstacles and clouds when they scroll past the left edge', () => {
    const rng = new RNG(111);
    const horizon = new Horizon(rng);

    // Cross clear time to spawn an obstacle
    for (let f = 0; f < 200; f++) {
      horizon.update(6, 1);
    }

    expect(horizon.obstacles.length).toBeGreaterThan(0);
    const initialObstacle = horizon.obstacles[0];

    // Fast-forward movement until the first obstacle scrolls completely off screen
    while (horizon.obstacles.includes(initialObstacle)) {
      horizon.update(13, 1);
    }

    // Verify it was cleanly removed
    expect(horizon.obstacles.includes(initialObstacle)).toBe(false);
  });
});
