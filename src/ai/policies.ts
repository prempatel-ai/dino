import type { GameState, ObstacleState } from '../core/types';
import type { AIDecision } from './types';

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
      // Obstacle is ahead or currently colliding
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
   * Clears ~71% of obstacles, fails on large/fast obstacles or high-speed runs.
   */
  static evaluateNaive(state: GameState): AIDecision {
    const { obs, distance } = this.getNearestObstacle(state);
    if (!obs) {
      return { action: 'NONE' };
    }

    const speed = state.speed;
    const threshold = 11 * speed;

    if (distance > 0 && distance < threshold) {
      return {
        action: 'JUMP',
        targetObs: obs,
        distance,
        threshold,
      };
    }

    return {
      action: 'NONE',
      targetObs: obs,
      distance,
      threshold,
    };
  }

  /**
   * Policy 2: The Evolved 3-Byte Linear Policy from the reel
   * "if distance < 14.5 * speed - 12.9: jump()"
   * Discovered via neuroevolution pruning. 100% win rate across 30,000 levels.
   */
  static evaluateLinear(state: GameState): AIDecision {
    const { obs, distance } = this.getNearestObstacle(state);
    if (!obs) {
      return { action: 'NONE' };
    }

    const speed = state.speed;
    const threshold = 14.5 * speed - 12.9;

    // Handle mid-elevation pterodactyls by ducking
    if (obs.type === 'PTERODACTYL' && obs.y === 75) {
      if (distance < speed * 16 && distance > -obs.w) {
        return {
          action: 'DUCK',
          targetObs: obs,
          distance,
          threshold,
        };
      }
    }

    // High pterodactyls (y=50) can be safely run under
    if (obs.type === 'PTERODACTYL' && obs.y === 50) {
      return {
        action: 'NONE',
        targetObs: obs,
        distance,
        threshold,
      };
    }

    // Cacti and low pterodactyls: jump at exact threshold
    if (distance > 0 && distance < threshold) {
      return {
        action: 'JUMP',
        targetObs: obs,
        distance,
        threshold,
      };
    }

    return {
      action: 'NONE',
      targetObs: obs,
      distance,
      threshold,
    };
  }
}
