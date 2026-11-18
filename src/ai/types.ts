import type { ObstacleState } from '../core/types';

export type AIMode = 'OFF' | 'NAIVE' | 'LINEAR' | 'ANN' | 'EVOLUTION';

export interface AIDecision {
  action: 'NONE' | 'JUMP' | 'DUCK';
  targetObs?: ObstacleState;
  distance?: number;
  threshold?: number;
  features?: number[];
  confidence?: number;
}

export interface AIEvaluationStats {
  generation: number;
  aliveCount: number;
  totalPopulation: number;
  bestFitness: number;
  crashes: number;
}
