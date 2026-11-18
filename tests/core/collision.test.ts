import { describe, it, expect } from 'vitest';
import { checkCollision } from '../../src/core/collision';
import { Trex } from '../../src/core/trex';
import { Obstacle } from '../../src/core/obstacle';
import { OBSTACLE_TYPES } from '../../src/core/constants';
import { RNG } from '../../src/core/rng';

describe('Collision Detection', () => {
  const rng = new RNG(42);

  it('standing dino hits small cactus at the same x position', () => {
    const trex = new Trex();
    const cactus = Obstacle.create('CACTUS_SMALL', 6, rng);
    cactus.x = trex.x + 10; // Overlapping x position on the ground

    expect(checkCollision(trex.getState(), cactus.getState())).toBe(true);
  });

  it('jumping dino at apex clears small and large cactus at speed 6', () => {
    const trex = new Trex();
    trex.startJump(6);

    // Advance to apex
    while (trex.y > 10) {
      trex.updateJump(1);
    }

    const smallCactus = Obstacle.create('CACTUS_SMALL', 6, rng);
    smallCactus.x = trex.x;
    expect(checkCollision(trex.getState(), smallCactus.getState())).toBe(false);

    const largeCactus = Obstacle.create('CACTUS_LARGE', 6, rng);
    largeCactus.x = trex.x;
    expect(checkCollision(trex.getState(), largeCactus.getState())).toBe(false);
  });

  it('ducking dino clears flying pterodactyl at height y=75 while standing dino hits it', () => {
    const trexStanding = new Trex();
    const trexDucking = new Trex();
    trexDucking.setDuck(true);

    const ptero = new Obstacle(OBSTACLE_TYPES.PTERODACTYL, 1, 9, rng);
    ptero.y = 75; // mid height
    ptero.x = trexStanding.x + 10;

    // Standing dino (y=93..140) collides with ptero (y=75..115)
    expect(checkCollision(trexStanding.getState(), ptero.getState())).toBe(true);

    // Ducking dino (y=115..140) passes safely under ptero
    expect(checkCollision(trexDucking.getState(), ptero.getState())).toBe(false);
  });

  it('returns false when outer bounding boxes overlap but specific sub-boxes miss', () => {
    const trex = new Trex();
    // Trex is at x=50, y=93, w=44, h=47
    // Trex head is in top right: relative (22, 0, 17, 16) -> world (72..89, 93..109)
    // Top-left area (x=50..71, y=93..110) has no sub-box!
    // We place a tiny custom obstacle right in that corner where outer box overlaps but sub-boxes do not.
    const customObstacleState = {
      type: 'CACTUS_SMALL' as const,
      x: 52,
      y: 94,
      w: 12,
      h: 12,
      size: 1,
      gap: 200,
      speedOffset: 0,
      frame: 0,
      animTimer: 0,
      followingObstacleCreated: false,
      collisionBoxes: [
        { x: 0, y: 0, w: 10, h: 10 },
      ],
    };

    // Dino outer box is (51, 94, 42, 45).
    // Obstacle outer box is (53, 95, 10, 10). They overlap!
    // But Trex sub-boxes do not cover (52..62, 94..104).
    expect(checkCollision(trex.getState(), customObstacleState)).toBe(false);
  });

  it('returns false when obstacle is far away', () => {
    const trex = new Trex();
    const cactus = Obstacle.create('CACTUS_SMALL', 6, rng);
    cactus.x = 400;

    expect(checkCollision(trex.getState(), cactus.getState())).toBe(false);
  });
});
