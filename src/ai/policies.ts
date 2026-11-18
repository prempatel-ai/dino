import type { GameState, ObstacleState } from '../core/types';
import type { AIDecision, NetworkState } from './types';

export class MathPolicies {
  /**
   * Find the nearest incoming obstacle ahead of Dino.
   */
  static getNearestObstacle(state: GameState): { obs: ObstacleState | null; distance: number } {
    const trex = state.trex;
    const dinoFront = trex.x + trex.w;

    let nearest: ObstacleState | null = null;
    let minDistance = Infinity;

    for (const obs of state.obstacles) {
      const obsBack = obs.x + obs.w;
      if (obsBack > trex.x) {
        const dist = obs.x - dinoFront;
        if (dist < minDistance) {
          minDistance = dist;
          nearest = obs;
        }
      }
    }

    return { obs: nearest, distance: minDistance };
  }

  /**
   * Policy 1: The Naive Rule from the reel
   * "if distance < 11 * speed: jump()"
   */
  static evaluateNaive(state: GameState): AIDecision {
    const { obs, distance } = this.getNearestObstacle(state);
    if (!obs) {
      return { action: 'NONE' };
    }

    const speed = state.speed;
    const threshold = 11 * speed;
    const shouldJump = distance > 0 && distance < threshold;
    const action = shouldJump ? 'JUMP' : 'NONE';

    const inDist = Math.min(1.0, Math.max(0.0, distance / 600));
    const inSpeed = speed / 20;
    const actionIndex = shouldJump ? 1 : 0;

    const networkState: NetworkState = {
      inputs: [inDist, obs.w / 100, obs.h / 100, obs.y / 150, state.trex.y / 100, state.trex.jumping ? 1 : 0, inSpeed],
      hidden: [shouldJump ? 0.9 : 0.1, 0.05, inSpeed, 1 - inDist],
      outputs: [actionIndex === 0 ? 0.88 : 0.12, actionIndex === 1 ? 0.88 : 0.12, 0.0],
      logits: [actionIndex === 0 ? 2.0 : -1.0, actionIndex === 1 ? 2.0 : -1.0, -2.0],
      actionIndex,
      confidence: 0.88,
      w1: [
        [-1.1, 0, 0, -1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1.1, 0, 1, 0],
      ],
      w2: [
        [0, 2.0, 0],
        [0, 0, 0],
        [0, 0.5, 0],
        [1.0, -0.5, 0],
      ],
    };

    return {
      action,
      targetObs: obs,
      distance,
      threshold,
      networkState,
    };
  }

  /**
   * Policy 2: The Evolved 3-Byte Linear Policy from the reel
   * "if distance < 14.5 * speed - 12.9: jump()"
   */
  static evaluateLinear(state: GameState): AIDecision {
    const { obs, distance } = this.getNearestObstacle(state);
    if (!obs) {
      return { action: 'NONE' };
    }

    const speed = state.speed;
    const threshold = 14.5 * speed - 12.9;

    let action: 'NONE' | 'JUMP' | 'DUCK' = 'NONE';

    // Handle mid-elevation pterodactyls by ducking
    if (obs.type === 'PTERODACTYL' && obs.y === 75) {
      if (distance < speed * 16 && distance > -obs.w) {
        action = 'DUCK';
      }
    } else if (obs.type === 'PTERODACTYL' && obs.y === 50) {
      action = 'NONE';
    } else if (distance > 0 && distance < threshold) {
      action = 'JUMP';
    }

    const inDist = Math.min(1.0, Math.max(0.0, distance / 600));
    const inSpeed = speed / 20;
    const actionIndex = action === 'JUMP' ? 1 : action === 'DUCK' ? 2 : 0;

    const networkState: NetworkState = {
      inputs: [inDist, obs.w / 100, obs.h / 100, obs.y / 150, state.trex.y / 100, state.trex.jumping ? 1 : 0, inSpeed],
      hidden: [
        action === 'JUMP' ? 0.95 : 0.05,
        action === 'DUCK' ? 0.95 : 0.05,
        inSpeed,
        1 - inDist,
      ],
      outputs: [
        actionIndex === 0 ? 0.94 : 0.03,
        actionIndex === 1 ? 0.97 : 0.02,
        actionIndex === 2 ? 0.95 : 0.02,
      ],
      logits: [actionIndex === 0 ? 3.0 : -1.0, actionIndex === 1 ? 3.5 : -1.0, actionIndex === 2 ? 3.2 : -1.0],
      actionIndex,
      confidence: 0.97,
      w1: [
        [-3.1, 0, 0, -1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 1.8, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1.8, 0, 1, 0],
      ],
      w2: [
        [0, 2.8, 0],
        [0, 0, 3.0],
        [0, 0.6, 0],
        [1.5, -0.6, -0.6],
      ],
    };

    return {
      action,
      targetObs: obs,
      distance,
      threshold,
      networkState,
    };
  }
}
