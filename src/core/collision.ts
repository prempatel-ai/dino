import {
  TREX_COLLISION_BOXES,
  TREX_DUCK_COLLISION_BOXES,
  type CollisionBoxDef,
} from './constants';
import type { TrexState, ObstacleState } from './types';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function boxCompare(b1: Box, b2: Box): boolean {
  return (
    b1.x < b2.x + b2.w &&
    b1.x + b1.w > b2.x &&
    b1.y < b2.y + b2.h &&
    b1.y + b1.h > b2.y
  );
}

export function checkCollision(trex: TrexState, obstacle: ObstacleState): boolean {
  // Phase 1: Outer box test (inset by 1px)
  const trexOuter: Box = {
    x: trex.x + 1,
    y: trex.y + 1,
    w: trex.w - 2,
    h: trex.h - 2,
  };

  const obstacleOuter: Box = {
    x: obstacle.x + 1,
    y: obstacle.y + 1,
    w: obstacle.w - 2,
    h: obstacle.h - 2,
  };

  if (!boxCompare(trexOuter, obstacleOuter)) {
    return false;
  }

  // Phase 2: Detailed sub-box intersection
  const tRexBoxes: readonly CollisionBoxDef[] = trex.ducking
    ? TREX_DUCK_COLLISION_BOXES
    : TREX_COLLISION_BOXES;

  const obstacleBoxes = obstacle.collisionBoxes;

  for (let t = 0; t < tRexBoxes.length; t++) {
    const tb = tRexBoxes[t];
    const tbWorld: Box = {
      x: trex.x + tb.x,
      y: trex.y + tb.y,
      w: tb.w,
      h: tb.h,
    };

    for (let o = 0; o < obstacleBoxes.length; o++) {
      const ob = obstacleBoxes[o];
      const obWorld: Box = {
        x: obstacle.x + ob.x,
        y: obstacle.y + ob.y,
        w: ob.w,
        h: ob.h,
      };

      if (boxCompare(tbWorld, obWorld)) {
        return true;
      }
    }
  }

  return false;
}

export function isNearMiss(trex: TrexState, obstacle: ObstacleState, margin: number = 6): boolean {
  // Checks if obstacle passes within margin px of trex without intersecting
  if (checkCollision(trex, obstacle)) {
    return false;
  }

  const trexExpanded: Box = {
    x: trex.x - margin,
    y: trex.y - margin,
    w: trex.w + margin * 2,
    h: trex.h + margin * 2,
  };

  const obstacleBox: Box = {
    x: obstacle.x,
    y: obstacle.y,
    w: obstacle.w,
    h: obstacle.h,
  };

  return boxCompare(trexExpanded, obstacleBox);
}
