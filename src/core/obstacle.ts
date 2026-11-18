import {
  OBSTACLE_TYPES,
  RUNNER_CONFIG,
  type CollisionBoxDef,
  type ObstacleTypeConfig,
} from './constants';
import type { ObstacleState } from './types';
import type { RNG } from './rng';

export class Obstacle implements ObstacleState {
  type: 'CACTUS_SMALL' | 'CACTUS_LARGE' | 'PTERODACTYL';
  x: number;
  y: number;
  w: number;
  h: number;
  size: number;
  gap: number;
  speedOffset: number;
  frame: number;
  animTimer: number;
  followingObstacleCreated: boolean;
  collisionBoxes: readonly CollisionBoxDef[];

  constructor(
    typeConfig: ObstacleTypeConfig,
    size: number,
    speed: number,
    rng: RNG,
  ) {
    this.type = typeConfig.type;
    this.size = size;
    this.w = typeConfig.width * size;
    this.h = typeConfig.height;
    this.x = RUNNER_CONFIG.WIDTH;
    this.followingObstacleCreated = false;
    this.frame = 0;
    this.animTimer = 0;

    if (this.type === 'PTERODACTYL') {
      const yPositions = typeConfig.yPosList ?? [100, 75, 50];
      const yIdx = rng.int(0, yPositions.length - 1);
      this.y = yPositions[yIdx];
      const sign = rng.next() < 0.5 ? -1 : 1;
      this.speedOffset = sign * (typeConfig.speedOffset ?? 0.8);
    } else {
      this.y = typeConfig.yPos;
      this.speedOffset = 0;
    }

    this.gap = Obstacle.getGap(this.w, typeConfig.minGap, RUNNER_CONFIG.GAP_COEFFICIENT, speed, rng);
    this.collisionBoxes = Obstacle.createCollisionBoxes(typeConfig, this.size, this.w);
  }

  static getGap(
    width: number,
    typeMinGap: number,
    gapCoefficient: number,
    speed: number,
    rng: RNG,
  ): number {
    const minGap = Math.round(width * speed + typeMinGap * gapCoefficient);
    const maxGap = Math.round(minGap * RUNNER_CONFIG.MAX_GAP_COEFFICIENT);
    return rng.int(minGap, maxGap);
  }

  static createCollisionBoxes(
    typeConfig: ObstacleTypeConfig,
    size: number,
    totalWidth: number,
  ): readonly CollisionBoxDef[] {
    const boxes = typeConfig.collisionBoxes.map((b) => ({ ...b }));

    if (size > 1 && boxes.length === 3) {
      // Small and large cactus multiple sizing
      boxes[1].w = totalWidth - boxes[0].w - boxes[2].w;
      boxes[2].x = totalWidth - boxes[2].w;
    }

    return boxes;
  }

  static create(
    typeKey: 'CACTUS_SMALL' | 'CACTUS_LARGE' | 'PTERODACTYL',
    speed: number,
    rng: RNG,
  ): Obstacle {
    const typeConfig = OBSTACLE_TYPES[typeKey];
    let size = rng.int(1, RUNNER_CONFIG.MAX_OBSTACLE_LENGTH);
    if (size > 1 && typeConfig.multipleSpeed > speed) {
      size = 1;
    }
    return new Obstacle(typeConfig, size, speed, rng);
  }

  isVisible(): boolean {
    return this.x + this.w > 0;
  }

  update(currentSpeed: number, frames: number = 1): void {
    const effectiveSpeed = currentSpeed + this.speedOffset;
    this.x -= Math.floor(effectiveSpeed * frames);

    if (this.type === 'PTERODACTYL') {
      // 60 fps / 6 fps = 10 frames per wing flap frame
      this.animTimer += frames;
      if (this.animTimer >= 10) {
        this.animTimer = 0;
        this.frame = (this.frame + 1) % 2;
      }
    }
  }

  getState(): ObstacleState {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      size: this.size,
      gap: this.gap,
      speedOffset: this.speedOffset,
      frame: this.frame,
      animTimer: this.animTimer,
      followingObstacleCreated: this.followingObstacleCreated,
      collisionBoxes: this.collisionBoxes,
    };
  }
}
