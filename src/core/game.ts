import {
  RUNNER_CONFIG,
  TREX_CONFIG,
} from './constants';
import { RNG } from './rng';
import { Trex } from './trex';
import { Horizon } from './horizon';
import { ScoreManager } from './score';
import { DayNightManager } from './daynight';
import { checkCollision, isNearMiss } from './collision';
import type {
  GameState,
  InputState,
  GamePhase,
  GameEvent,
} from './types';

export class Game {
  phase: GamePhase = 'READY';
  speed: number = RUNNER_CONFIG.SPEED;
  elapsedMs: number = 0;
  crashTimerMs: number = 0;
  introTimerMs: number = 0;

  readonly trex: Trex;
  readonly horizon: Horizon;
  readonly scoreManager: ScoreManager;
  readonly dayNightManager: DayNightManager;
  readonly rng: RNG;

  private currentEvents: GameEvent[] = [];

  constructor(seed: number = 1337, initialHighScore: number = 0) {
    this.rng = new RNG(seed);
    this.trex = new Trex();
    this.horizon = new Horizon(this.rng);
    this.scoreManager = new ScoreManager(initialHighScore);
    this.dayNightManager = new DayNightManager();
    this.reset(seed);
  }

  reset(seed?: number): void {
    if (seed !== undefined) {
      this.rng.setSeed(seed);
    }
    this.phase = 'READY';
    this.speed = RUNNER_CONFIG.SPEED;
    this.elapsedMs = 0;
    this.crashTimerMs = 0;
    this.introTimerMs = 0;
    this.currentEvents = [];

    this.trex.reset();
    this.horizon.reset();
    this.scoreManager.reset();
    this.dayNightManager.reset();
  }

  get state(): GameState {
    const scoreVal = this.scoreManager.score;
    const biomeIndex = Math.floor(scoreVal / RUNNER_CONFIG.INVERT_DISTANCE) % 7;

    return {
      phase: this.phase,
      trex: this.trex.getState(),
      obstacles: this.horizon.getObstacleStates(),
      clouds: this.horizon.getCloudStates(),
      groundOffset: this.horizon.groundOffset,
      speed: this.speed,
      distance: this.scoreManager.distance,
      score: scoreVal,
      highScore: this.scoreManager.highScore,
      isNight: this.dayNightManager.isNight,
      nightFade: this.dayNightManager.nightFade,
      moonPhase: this.dayNightManager.moonPhase,
      isFlashing: this.scoreManager.isFlashing,
      flashIterations: this.scoreManager.flashIterations,
      elapsedMs: this.elapsedMs,
      biomeIndex,
      events: [...this.currentEvents],
    };
  }

  step(input: InputState, frames: number = 1): void {
    this.currentEvents = [];
    const msElapsed = frames * (1000 / RUNNER_CONFIG.FPS);
    this.elapsedMs += msElapsed;

    switch (this.phase) {
      case 'BOOT':
      case 'READY':
        this.handleReadyPhase(input, frames);
        break;

      case 'INTRO':
        this.handleIntroPhase(input, frames, msElapsed);
        break;

      case 'RUNNING':
        this.handleRunningPhase(input, frames, msElapsed);
        break;

      case 'CRASHED':
        this.handleCrashedPhase(input, msElapsed);
        break;
    }
  }

  private handleReadyPhase(input: InputState, frames: number): void {
    this.trex.updateAnim(frames);

    if (input.jumpPressed) {
      // Start intro
      this.phase = 'INTRO';
      this.introTimerMs = 0;
      this.currentEvents.push('jump');
      this.trex.startJump(this.speed);
    }
  }

  private handleIntroPhase(
    _input: InputState,
    frames: number,
    msElapsed: number,
  ): void {
    this.introTimerMs += msElapsed;

    // Update jump physics and ground
    const landed = this.trex.updateJump(frames);
    if (landed) {
      this.currentEvents.push('land');
    }
    this.trex.updateAnim(frames);
    this.horizon.update(this.speed, frames);

    if (this.introTimerMs >= TREX_CONFIG.INTRO_DURATION) {
      this.phase = 'RUNNING';
    }
  }

  private handleRunningPhase(
    input: InputState,
    frames: number,
    _msElapsed: number,
  ): void {
    // 1. Process Input
    if (input.duckHeld) {
      this.trex.setDuck(true);
    } else {
      this.trex.setDuck(false);
    }

    if (input.jumpPressed) {
      const jumped = this.trex.startJump(this.speed);
      if (jumped) {
        this.currentEvents.push('jump');
      }
    } else if (!input.jumpHeld && this.trex.jumping) {
      this.trex.endJump();
    }

    // 2. Update Trex
    const landed = this.trex.updateJump(frames);
    if (landed) {
      this.currentEvents.push('land');
    }
    this.trex.updateAnim(frames);

    // 3. Update Horizon (ground, clouds, obstacles)
    this.horizon.update(this.speed, frames);

    // 4. Collision Detection
    const trexState = this.trex.getState();
    const obstacles = this.horizon.obstacles;

    for (let i = 0; i < obstacles.length; i++) {
      const obsState = obstacles[i].getState();
      if (checkCollision(trexState, obsState)) {
        this.phase = 'CRASHED';
        this.crashTimerMs = 0;
        this.currentEvents.push('crash');
        const newHi = this.scoreManager.onCrash();
        if (newHi) {
          this.currentEvents.push('highScore');
        }
        return;
      }

      if (isNearMiss(trexState, obsState, 6)) {
        this.currentEvents.push('nearMiss');
      }
    }

    // 5. Speed acceleration & Score calculation
    if (this.speed < RUNNER_CONFIG.MAX_SPEED) {
      this.speed = Math.min(
        RUNNER_CONFIG.MAX_SPEED,
        this.speed + RUNNER_CONFIG.ACCELERATION * frames,
      );
    }

    const { milestoneAchieved, newHighScore } = this.scoreManager.update(
      this.speed,
      frames,
      1000 / RUNNER_CONFIG.FPS,
    );
    if (milestoneAchieved) {
      this.currentEvents.push('milestone');
    }
    if (newHighScore) {
      this.currentEvents.push('highScore');
    }

    // 6. Day / Night & Biome transition
    const { biomeChanged } = this.dayNightManager.update(
      this.scoreManager.score,
      frames,
      1000 / RUNNER_CONFIG.FPS,
    );
    if (biomeChanged) {
      this.currentEvents.push('biomeChange');
    }
  }

  private handleCrashedPhase(input: InputState, msElapsed: number): void {
    this.crashTimerMs += msElapsed;

    // Accept restart only after GAMEOVER_CLEAR_TIME (750 ms)
    if (this.crashTimerMs >= RUNNER_CONFIG.GAMEOVER_CLEAR_TIME) {
      if (input.restartPressed || input.jumpPressed) {
        // Restart into RUNNING phase directly as per original
        const savedHighScore = this.scoreManager.highScore;
        this.reset();
        this.scoreManager.setHighScore(savedHighScore);
        this.phase = 'RUNNING';
      }
    }
  }
}
