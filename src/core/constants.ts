export interface CollisionBoxDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ObstacleTypeConfig {
  type: 'CACTUS_SMALL' | 'CACTUS_LARGE' | 'PTERODACTYL';
  width: number;
  height: number;
  yPos: number;
  yPosList?: readonly number[];
  minGap: number;
  minSpeed: number;
  multipleSpeed: number;
  frames: number;
  frameRate?: number;
  speedOffset?: number;
  collisionBoxes: readonly CollisionBoxDef[];
}

export const RUNNER_CONFIG = {
  WIDTH: 600,
  HEIGHT: 150,
  FPS: 60,
  SPEED: 6,
  MAX_SPEED: 13,
  ACCELERATION: 0.001,
  BOTTOM_PAD: 10,
  CLEAR_TIME: 3000,
  GAP_COEFFICIENT: 0.6,
  MAX_GAP_COEFFICIENT: 1.5,
  MAX_OBSTACLE_LENGTH: 3,
  MAX_OBSTACLE_DUPLICATION: 2,
  GAMEOVER_CLEAR_TIME: 750,
  GRAVITY: 0.6,
  INVERT_DISTANCE: 700,
  MAX_CLOUDS: 6,
  CLOUD_FREQUENCY: 0.5,
  BG_CLOUD_SPEED: 0.2,
} as const;

export const TREX_CONFIG = {
  WIDTH: 44,
  HEIGHT: 47,
  WIDTH_DUCK: 59,
  HEIGHT_DUCK: 25,
  START_X_POS: 50,
  GROUND_Y_POS: 93, // 150 - 47 - 10
  INITIAL_JUMP_VELOCITY: -10,
  DROP_VELOCITY: -5,
  MIN_JUMP_HEIGHT: 30,
  MAX_JUMP_HEIGHT: 30,
  SPEED_DROP_COEFFICIENT: 3,
  INTRO_DURATION: 1500,
  RUN_FRAME_RATE: 12,
  MS_PER_FRAME: 1000 / 60,
} as const;

export const SCORE_CONFIG = {
  COEFFICIENT: 0.025,
  MAX_SCORE: 99999,
  ACHIEVEMENT_DISTANCE: 100,
  FLASH_DURATION: 250,
  FLASH_ITERATIONS: 3,
} as const;

export const HORIZON_CONFIG = {
  HORIZON_Y: 127,
  CLOUD_WIDTH: 46,
  CLOUD_HEIGHT: 14,
  CLOUD_MIN_Y: 30,
  CLOUD_MAX_Y: 71,
  CLOUD_MIN_GAP: 100,
  CLOUD_MAX_GAP: 400,
  CLOUD_SPEED: 0.2,
} as const;

export const TREX_COLLISION_BOXES: readonly CollisionBoxDef[] = [
  { x: 22, y: 0, w: 17, h: 16 },
  { x: 1, y: 18, w: 30, h: 9 },
  { x: 10, y: 35, w: 14, h: 8 },
  { x: 1, y: 24, w: 29, h: 5 },
  { x: 5, y: 30, w: 21, h: 4 },
  { x: 9, y: 34, w: 15, h: 4 },
];

export const TREX_DUCK_COLLISION_BOXES: readonly CollisionBoxDef[] = [
  { x: 1, y: 18, w: 55, h: 25 },
];

export const OBSTACLE_TYPES: Record<'CACTUS_SMALL' | 'CACTUS_LARGE' | 'PTERODACTYL', ObstacleTypeConfig> = {
  CACTUS_SMALL: {
    type: 'CACTUS_SMALL',
    width: 17,
    height: 35,
    yPos: 105,
    minGap: 120,
    minSpeed: 0,
    multipleSpeed: 4,
    frames: 1,
    collisionBoxes: [
      { x: 0, y: 7, w: 5, h: 27 },
      { x: 4, y: 0, w: 6, h: 34 },
      { x: 10, y: 4, w: 7, h: 14 },
    ],
  },
  CACTUS_LARGE: {
    type: 'CACTUS_LARGE',
    width: 25,
    height: 50,
    yPos: 90,
    minGap: 120,
    minSpeed: 0,
    multipleSpeed: 7,
    frames: 1,
    collisionBoxes: [
      { x: 0, y: 12, w: 7, h: 38 },
      { x: 8, y: 0, w: 7, h: 49 },
      { x: 13, y: 10, w: 10, h: 38 },
    ],
  },
  PTERODACTYL: {
    type: 'PTERODACTYL',
    width: 46,
    height: 40,
    yPos: 100,
    yPosList: [100, 75, 50],
    minGap: 150,
    minSpeed: 8.5,
    multipleSpeed: 999,
    frames: 2,
    frameRate: 6,
    speedOffset: 0.8,
    collisionBoxes: [
      { x: 15, y: 15, w: 16, h: 5 },
      { x: 18, y: 21, w: 24, h: 6 },
      { x: 2, y: 14, w: 4, h: 3 },
      { x: 6, y: 10, w: 4, h: 7 },
      { x: 10, y: 8, w: 6, h: 9 },
    ],
  },
};
