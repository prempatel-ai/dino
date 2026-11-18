import {
  RUNNER_CONFIG,
  HORIZON_CONFIG,
  OBSTACLE_TYPES,
} from './constants';
import { Obstacle } from './obstacle';
import type { CloudState, ObstacleState } from './types';
import type { RNG } from './rng';

export class Cloud implements CloudState {
  x: number = RUNNER_CONFIG.WIDTH;
  y: number;
  gap: number;

  constructor(rng: RNG) {
    this.y = rng.int(HORIZON_CONFIG.CLOUD_MIN_Y, HORIZON_CONFIG.CLOUD_MAX_Y);
    this.gap = rng.int(HORIZON_CONFIG.CLOUD_MIN_GAP, HORIZON_CONFIG.CLOUD_MAX_GAP);
  }

  update(frames: number = 1): void {
    this.x -= HORIZON_CONFIG.CLOUD_SPEED * frames;
  }

  isVisible(): boolean {
    return this.x + HORIZON_CONFIG.CLOUD_WIDTH > 0;
  }
}

export class Horizon {
  groundOffset: number = 0;
  clouds: Cloud[] = [];
  obstacles: Obstacle[] = [];
  obstacleHistory: ('CACTUS_SMALL' | 'CACTUS_LARGE' | 'PTERODACTYL')[] = [];

  private runningTimeMs: number = 0;
  private rng: RNG;

  constructor(rng: RNG) {
    this.rng = rng;
    this.reset();
  }

  reset(): void {
    this.groundOffset = 0;
    this.clouds = [];
    this.obstacles = [];
    this.obstacleHistory = [];
    this.runningTimeMs = 0;
  }

  update(currentSpeed: number, frames: number = 1): void {
    this.runningTimeMs += frames * (1000 / RUNNER_CONFIG.FPS);

    // 1. Update ground offset
    this.groundOffset = (this.groundOffset + Math.floor(currentSpeed * frames)) % RUNNER_CONFIG.WIDTH;

    // 2. Update clouds
    this.updateClouds(frames);

    // 3. Update obstacles
    this.updateObstacles(currentSpeed, frames);
  }

  private updateClouds(frames: number): void {
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      this.clouds[i].update(frames);
      if (!this.clouds[i].isVisible()) {
        this.clouds.splice(i, 1);
      }
    }

    if (this.clouds.length < RUNNER_CONFIG.MAX_CLOUDS) {
      const lastCloud = this.clouds[this.clouds.length - 1];
      if (
        !lastCloud ||
        (RUNNER_CONFIG.WIDTH - lastCloud.x > lastCloud.gap &&
          this.rng.next() > RUNNER_CONFIG.CLOUD_FREQUENCY)
      ) {
        this.clouds.push(new Cloud(this.rng));
      }
    }
  }

  private updateObstacles(currentSpeed: number, frames: number): void {
    // 1. Move and cull obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].update(currentSpeed, frames);
      if (!this.obstacles[i].isVisible()) {
        this.obstacles.splice(i, 1);
      }
    }

    // 2. Obstacles can only spawn after CLEAR_TIME (3000 ms)
    if (this.runningTimeMs < RUNNER_CONFIG.CLEAR_TIME) {
      return;
    }

    // 3. Check spawn trigger
    if (this.obstacles.length === 0) {
      this.addNewObstacle(currentSpeed);
    } else {
      const last = this.obstacles[this.obstacles.length - 1];
      if (
        !last.followingObstacleCreated &&
        last.isVisible() &&
        last.x + last.w + last.gap < RUNNER_CONFIG.WIDTH
      ) {
        this.addNewObstacle(currentSpeed);
        last.followingObstacleCreated = true;
      }
    }
  }

  private addNewObstacle(speed: number): void {
    // Eligible obstacle types based on current speed
    const availableTypes: ('CACTUS_SMALL' | 'CACTUS_LARGE' | 'PTERODACTYL')[] = [];

    const keys: ('CACTUS_SMALL' | 'CACTUS_LARGE' | 'PTERODACTYL')[] = [
      'CACTUS_SMALL',
      'CACTUS_LARGE',
      'PTERODACTYL',
    ];

    for (const key of keys) {
      const config = OBSTACLE_TYPES[key];
      // Reject if minSpeed not met
      if (config.minSpeed > speed) {
        continue;
      }

      // Reject if same type already last MAX_OBSTACLE_DUPLICATION times in a row
      if (this.isDuplicateType(key)) {
        continue;
      }

      availableTypes.push(key);
    }

    if (availableTypes.length === 0) {
      // Fallback to CACTUS_SMALL if all filtered out
      availableTypes.push('CACTUS_SMALL');
    }

    const chosenType = availableTypes[this.rng.int(0, availableTypes.length - 1)];
    const obstacle = Obstacle.create(chosenType, speed, this.rng);

    this.obstacles.push(obstacle);
    this.obstacleHistory.push(chosenType);
  }

  private isDuplicateType(type: 'CACTUS_SMALL' | 'CACTUS_LARGE' | 'PTERODACTYL'): boolean {
    const len = this.obstacleHistory.length;
    if (len < RUNNER_CONFIG.MAX_OBSTACLE_DUPLICATION) {
      return false;
    }

    for (let i = 1; i <= RUNNER_CONFIG.MAX_OBSTACLE_DUPLICATION; i++) {
      if (this.obstacleHistory[len - i] !== type) {
        return false;
      }
    }

    return true;
  }

  getObstacleStates(): readonly ObstacleState[] {
    return this.obstacles.map((o) => o.getState());
  }

  getCloudStates(): readonly CloudState[] {
    return this.clouds.map((c) => ({
      x: c.x,
      y: c.y,
      gap: c.gap,
    }));
  }
}
