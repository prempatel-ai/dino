import type { CollisionBoxDef } from './constants';

export type GamePhase = 'BOOT' | 'READY' | 'INTRO' | 'RUNNING' | 'CRASHED';

export type GameEvent = 'jump' | 'land' | 'crash' | 'milestone' | 'nearMiss' | 'highScore' | 'biomeChange';

export interface TrexState {
  x: number;
  y: number;
  w: number;
  h: number;
  ducking: boolean;
  jumping: boolean;
  jumpVelocity: number;
  reachedMinHeight: boolean;
  speedDrop: boolean;
  frame: number;
  animTimer: number;
}

export interface ObstacleState {
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
}

export interface CloudState {
  x: number;
  y: number;
  gap: number;
}

export interface InputState {
  jumpPressed: boolean;
  jumpHeld: boolean;
  duckHeld: boolean;
  restartPressed: boolean;
}

export interface GameState {
  phase: GamePhase;
  trex: TrexState;
  obstacles: readonly ObstacleState[];
  clouds: readonly CloudState[];
  groundOffset: number;
  speed: number;
  distance: number;
  score: number;
  highScore: number;
  isNight: boolean;
  nightFade: number;
  moonPhase: number;
  isFlashing: boolean;
  flashIterations: number;
  elapsedMs: number;
  biomeIndex: number;
  events: readonly GameEvent[];
}
