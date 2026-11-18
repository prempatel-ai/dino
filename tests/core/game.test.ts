import { describe, it, expect } from 'vitest';
import { Game } from '../../src/core/game';
import type { InputState } from '../../src/core/types';

describe('Game State Machine & Simulation', () => {
  const idleInput: InputState = {
    jumpPressed: false,
    jumpHeld: false,
    duckHeld: false,
    restartPressed: false,
  };

  it('bot that never jumps crashes at the first obstacle', () => {
    const game = new Game(12345);
    // Start game
    game.step({ ...idleInput, jumpPressed: true });

    // Progress through intro
    while (game.phase !== 'RUNNING') {
      game.step(idleInput);
    }

    // Now run without jumping until it crashes
    let steps = 0;
    while (game.phase === 'RUNNING' && steps < 5000) {
      game.step(idleInput);
      steps++;
    }

    expect(game.phase).toBe('CRASHED');
    expect(game.state.events).toContain('crash');
    expect(steps).toBeGreaterThan(0);
    expect(steps).toBeLessThan(5000);
  });

  it('is completely deterministic: same seed and inputs produce identical state after 5000 steps', () => {
    const runSimulation = (seed: number) => {
      const game = new Game(seed);
      // Start
      game.step({ ...idleInput, jumpPressed: true });

      // Run 5000 steps with simulated jumps periodically
      for (let i = 0; i < 5000; i++) {
        const jumpNow = i % 120 === 0;
        const duckNow = i % 250 > 200;
        game.step({
          jumpPressed: jumpNow,
          jumpHeld: jumpNow,
          duckHeld: duckNow,
          restartPressed: false,
        });
      }
      return {
        score: game.state.score,
        distance: game.state.distance,
        speed: game.state.speed,
        phase: game.state.phase,
        trex: game.state.trex,
        groundOffset: game.state.groundOffset,
        obstaclesCount: game.state.obstacles.length,
      };
    };

    const run1 = runSimulation(98765);
    const run2 = runSimulation(98765);

    expect(run1).toEqual(run2);
  });

  it('speed accelerates from 6 up to 13 and caps', () => {
    const game = new Game(42);
    // Directly set to running to test speed acceleration curve
    game.phase = 'RUNNING';

    expect(game.speed).toBe(6);

    // Run for 10000 steps
    for (let i = 0; i < 10000; i++) {
      // Avoid crash by clearing obstacles
      game.horizon.obstacles = [];
      game.step(idleInput);
    }

    expect(game.speed).toBe(13);
  });

  it('fires milestone event and flash sequence at score 100 and 200', () => {
    const game = new Game(77);
    game.phase = 'RUNNING';

    const milestonesSeen: number[] = [];

    // Advance until score crosses 200
    while (game.state.score < 250) {
      game.horizon.obstacles = [];
      game.step(idleInput);

      if (game.state.events.includes('milestone')) {
        milestonesSeen.push(game.state.score);
      }
    }

    expect(milestonesSeen.length).toBeGreaterThanOrEqual(2);
    expect(milestonesSeen[0]).toBeGreaterThanOrEqual(100);
    expect(milestonesSeen[1]).toBeGreaterThanOrEqual(200);
  });

  it('ignores restart input before 750 ms in CRASHED, and accepts it after 750 ms', () => {
    const game = new Game(100);
    game.phase = 'CRASHED';
    game.crashTimerMs = 0;

    // Try restart immediately at 200 ms
    game.step({ ...idleInput, restartPressed: true }, 12); // 12 frames * 16.6ms ≈ 200ms
    expect(game.phase).toBe('CRASHED');

    // Advance to 700 ms total
    game.step({ ...idleInput, restartPressed: true }, 30); // total ~700ms
    expect(game.phase).toBe('CRASHED');

    // Cross 750 ms threshold and press restart
    game.step({ ...idleInput, restartPressed: true }, 10); // now > 750ms
    expect(game.phase).toBe('RUNNING');
    expect(game.speed).toBe(6);
    expect(game.state.distance).toBe(0);
  });
});
