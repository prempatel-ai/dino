import {
  TREX_CONFIG,
  RUNNER_CONFIG,
} from './constants';
import type { TrexState } from './types';

export class Trex {
  x: number = TREX_CONFIG.START_X_POS;
  y: number = TREX_CONFIG.GROUND_Y_POS;
  w: number = TREX_CONFIG.WIDTH;
  h: number = TREX_CONFIG.HEIGHT;
  ducking: boolean = false;
  jumping: boolean = false;
  jumpVelocity: number = 0;
  reachedMinHeight: boolean = false;
  speedDrop: boolean = false;
  frame: number = 0;
  animTimer: number = 0;

  private isAirDuckPending: boolean = false;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.x = TREX_CONFIG.START_X_POS;
    this.y = TREX_CONFIG.GROUND_Y_POS;
    this.w = TREX_CONFIG.WIDTH;
    this.h = TREX_CONFIG.HEIGHT;
    this.ducking = false;
    this.jumping = false;
    this.jumpVelocity = 0;
    this.reachedMinHeight = false;
    this.speedDrop = false;
    this.frame = 0;
    this.animTimer = 0;
    this.isAirDuckPending = false;
  }

  startJump(speed: number): boolean {
    if (this.jumping || this.ducking) {
      return false;
    }
    this.jumping = true;
    this.jumpVelocity = TREX_CONFIG.INITIAL_JUMP_VELOCITY - speed / 10;
    this.reachedMinHeight = false;
    this.speedDrop = false;
    return true;
  }

  updateJump(frames: number = 1): boolean {
    if (!this.jumping) {
      return false;
    }

    if (this.speedDrop) {
      this.y += Math.round(this.jumpVelocity * TREX_CONFIG.SPEED_DROP_COEFFICIENT * frames);
    } else {
      this.y += Math.round(this.jumpVelocity * frames);
    }

    this.jumpVelocity += RUNNER_CONFIG.GRAVITY * frames;

    const minJumpHeight = TREX_CONFIG.GROUND_Y_POS - TREX_CONFIG.MIN_JUMP_HEIGHT;
    if (this.y < minJumpHeight || this.speedDrop) {
      this.reachedMinHeight = true;
    }

    if (this.y < TREX_CONFIG.MAX_JUMP_HEIGHT || this.speedDrop) {
      this.endJump();
    }

    // Check if landed
    if (this.y > TREX_CONFIG.GROUND_Y_POS) {
      this.land();
      return true; // landed event
    }

    return false;
  }

  endJump(): void {
    if (this.reachedMinHeight && this.jumpVelocity < TREX_CONFIG.DROP_VELOCITY) {
      this.jumpVelocity = TREX_CONFIG.DROP_VELOCITY;
    }
  }

  land(): void {
    this.y = TREX_CONFIG.GROUND_Y_POS;
    this.jumping = false;
    this.jumpVelocity = 0;
    this.speedDrop = false;
    this.reachedMinHeight = false;

    if (this.isAirDuckPending) {
      this.isAirDuckPending = false;
      this.setDuck(true);
    } else if (this.ducking) {
      this.y = TREX_CONFIG.GROUND_Y_POS + (TREX_CONFIG.HEIGHT - TREX_CONFIG.HEIGHT_DUCK);
      this.w = TREX_CONFIG.WIDTH_DUCK;
      this.h = TREX_CONFIG.HEIGHT_DUCK;
    } else {
      this.w = TREX_CONFIG.WIDTH;
      this.h = TREX_CONFIG.HEIGHT;
    }
  }

  setSpeedDrop(active: boolean): void {
    this.speedDrop = active;
    if (active && this.jumping) {
      this.jumpVelocity = 1;
    }
  }

  setDuck(isDucking: boolean): void {
    if (this.jumping) {
      // In air, duck button triggers fast drop
      this.setSpeedDrop(isDucking);
      this.isAirDuckPending = isDucking;
      return;
    }

    this.isAirDuckPending = false;
    if (isDucking) {
      this.ducking = true;
      this.w = TREX_CONFIG.WIDTH_DUCK;
      this.h = TREX_CONFIG.HEIGHT_DUCK;
      this.y = TREX_CONFIG.GROUND_Y_POS + (TREX_CONFIG.HEIGHT - TREX_CONFIG.HEIGHT_DUCK);
    } else {
      this.ducking = false;
      this.w = TREX_CONFIG.WIDTH;
      this.h = TREX_CONFIG.HEIGHT;
      this.y = TREX_CONFIG.GROUND_Y_POS;
    }
  }

  updateAnim(frames: number = 1): void {
    if (this.jumping) {
      this.frame = 0;
      return;
    }

    // 60 fps / 12 fps = 5 frames per anim step
    this.animTimer += frames;
    if (this.animTimer >= 5) {
      this.animTimer = 0;
      this.frame = (this.frame + 1) % 2;
    }
  }

  getState(): TrexState {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      ducking: this.ducking,
      jumping: this.jumping,
      jumpVelocity: this.jumpVelocity,
      reachedMinHeight: this.reachedMinHeight,
      speedDrop: this.speedDrop,
      frame: this.frame,
      animTimer: this.animTimer,
    };
  }
}
