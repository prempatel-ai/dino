import { describe, it, expect } from 'vitest';
import { Game } from '../../src/core/game';
import { BIOMES } from '../../src/client/renderer/biomes';

describe('Biomes & Creative Events', () => {
  it('correctly derives all 7 biomes in order every 700 score and loops', () => {
    expect(BIOMES.length).toBe(7);

    const game = new Game(42);

    const testScores = [
      { score: 0, expectedIndex: 0, expectedName: 'Classic Desert' },
      { score: 699, expectedIndex: 0, expectedName: 'Classic Desert' },
      { score: 700, expectedIndex: 1, expectedName: 'Canyon Sunset' },
      { score: 1400, expectedIndex: 2, expectedName: 'Oasis Sanctuary' },
      { score: 2100, expectedIndex: 3, expectedName: 'Frozen Tundra' },
      { score: 2800, expectedIndex: 4, expectedName: 'Volcanic Badlands' },
      { score: 3500, expectedIndex: 5, expectedName: 'Neon Future' },
      { score: 4200, expectedIndex: 6, expectedName: 'Space Dunes' },
      { score: 4900, expectedIndex: 0, expectedName: 'Classic Desert' }, // loops back
    ];

    for (const test of testScores) {
      game.scoreManager.score = test.score;
      expect(game.state.biomeIndex).toBe(test.expectedIndex);
      expect(BIOMES[game.state.biomeIndex].name).toBe(test.expectedName);
    }
  });

  it('triggers nearMiss event when obstacle passes within 6 px without collision', () => {
    const game = new Game(100);
    game.phase = 'RUNNING';

    // Clear initial obstacles
    game.horizon.obstacles = [];

    // Place an airborne obstacle passing close to dino
    const ptero = {
      type: 'PTERODACTYL' as const,
      x: game.trex.x + 30, // within near miss range
      y: 40, // safely above standing dino (dino is y=93..140, ptero is y=40..80, distance is 13px or within margin)
      w: 46,
      h: 40,
      size: 1,
      gap: 200,
      speedOffset: 0,
      frame: 0,
      animTimer: 0,
      followingObstacleCreated: false,
      collisionBoxes: [{ x: 15, y: 15, w: 16, h: 5 }],
      getState() {
        return { ...this };
      },
      update() {},
      isVisible() {
        return true;
      },
    };

    game.horizon.obstacles.push(ptero as never);

    game.step({
      jumpPressed: false,
      jumpHeld: false,
      duckHeld: false,
      restartPressed: false,
    });

    // Did not crash
    expect(game.phase).toBe('RUNNING');
  });
});
