import { describe, it, expect } from 'vitest';
import { Game } from '../../src/core/game';
import type { InputState } from '../../src/core/types';

describe('Effects & Visual Modes Equivalence', () => {
  it('core game simulation state is strictly identical regardless of visual settings or effects', () => {
    // Run simulation A
    const gameA = new Game(999);
    // Run simulation B with identical seed
    const gameB = new Game(999);

    const idleInput: InputState = {
      jumpPressed: false,
      jumpHeld: false,
      duckHeld: false,
      restartPressed: false,
    };

    gameA.step({ ...idleInput, jumpPressed: true });
    gameB.step({ ...idleInput, jumpPressed: true });

    for (let f = 0; f < 3000; f++) {
      const input: InputState = {
        jumpPressed: f % 180 === 0,
        jumpHeld: f % 180 < 10,
        duckHeld: f % 300 > 250,
        restartPressed: false,
      };

      gameA.step(input);
      gameB.step(input);

      expect(gameA.state.score).toBe(gameB.state.score);
      expect(gameA.state.speed).toBe(gameB.state.speed);
      expect(gameA.state.distance).toBe(gameB.state.distance);
      expect(gameA.state.trex).toEqual(gameB.state.trex);
      expect(gameA.state.phase).toBe(gameB.state.phase);
      expect(gameA.state.isNight).toBe(gameB.state.isNight);
    }
  });
});
