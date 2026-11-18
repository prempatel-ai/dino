import { describe, it, expect } from 'vitest';
import { Game } from '../../src/core/game';
import type { InputState } from '../../src/core/types';

describe('Golden-State Simulation Tests', () => {
  it('reproduces exact deterministic state at steps 100, 1000, and 5000', () => {
    const game = new Game(12345);
    const idleInput: InputState = {
      jumpPressed: false,
      jumpHeld: false,
      duckHeld: false,
      restartPressed: false,
    };

    // Step 0: start intro
    game.step({ ...idleInput, jumpPressed: true });

    const snapshots: Record<number, unknown> = {};

    for (let step = 1; step <= 5000; step++) {
      // Deterministic scripted player inputs
      const isJump = step % 140 === 0;
      const isDuck = step % 350 > 300;

      game.step({
        jumpPressed: isJump,
        jumpHeld: isJump,
        duckHeld: isDuck,
        restartPressed: false,
      });

      if (step === 100 || step === 1000 || step === 5000) {
        snapshots[step] = {
          step,
          phase: game.state.phase,
          score: game.state.score,
          speed: Number(game.state.speed.toFixed(3)),
          distance: Math.round(game.state.distance),
          trex: {
            x: game.state.trex.x,
            y: game.state.trex.y,
            w: game.state.trex.w,
            h: game.state.trex.h,
            ducking: game.state.trex.ducking,
            jumping: game.state.trex.jumping,
          },
          obstaclesCount: game.state.obstacles.length,
          biomeIndex: game.state.biomeIndex,
          isNight: game.state.isNight,
        };
      }
    }

    expect(snapshots).toMatchSnapshot();
  });
});
