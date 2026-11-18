import { describe, it, expect } from 'vitest';
import { Game } from '../../src/core/game';
import type { InputState } from '../../src/core/types';

describe('Automated Bot Survival Tests', () => {
  const seeds = [101, 202, 303, 404, 505];

  seeds.forEach((seed) => {
    it(`bot survives > 3000 steps on seed ${seed}, proving all generated patterns are clearable`, () => {
      const game = new Game(seed);

      // Start game
      game.step({
        jumpPressed: true,
        jumpHeld: true,
        duckHeld: false,
        restartPressed: false,
      });

      let stepsSurvived = 0;
      const targetSteps = 3000;

      for (let s = 1; s <= targetSteps; s++) {
        if (game.phase === 'CRASHED') {
          break;
        }

        const trex = game.state.trex;
        const obstacles = game.state.obstacles;
        const speed = game.state.speed;

        // Find incoming obstacle
        const incoming = obstacles.find((obs) => obs.x + obs.w > trex.x);

        let jump = false;
        let duck = false;

        if (incoming) {
          const distance = incoming.x - trex.x;

          if (incoming.type === 'PTERODACTYL' && incoming.y === 75) {
            // Mid ptero: duck under it
            if (distance < speed * 18 && distance > -incoming.w) {
              duck = true;
            }
          } else if (incoming.type === 'PTERODACTYL' && incoming.y === 50) {
            // High ptero: can safely run under without jumping
            duck = false;
            jump = false;
          } else {
            // Cactus or low ptero (y=100): jump
            if (distance < speed * 18 && distance > 0) {
              jump = true;
            }
          }
        }

        const input: InputState = {
          jumpPressed: jump && !trex.jumping,
          jumpHeld: jump,
          duckHeld: duck,
          restartPressed: false,
        };

        game.step(input);
        stepsSurvived++;
      }

      expect(stepsSurvived).toBeGreaterThanOrEqual(targetSteps);
      expect(game.phase).toBe('RUNNING');
    });
  });
});
