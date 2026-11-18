import type { ObstacleState } from '../core/types';

export type AIMode = 'OFF' | 'NAIVE' | 'LINEAR' | 'ANN' | 'EVOLUTION';

export interface NetworkState {
  inputs: number[];
  hidden: number[];
  outputs: number[];
  logits: number[];
  actionIndex: number;
  confidence: number;
  w1: number[][];
  w2: number[][];
}

export interface AIDecision {
  action: 'NONE' | 'JUMP' | 'DUCK';
  targetObs?: ObstacleState;
  distance?: number;
  threshold?: number;
  features?: number[];
  confidence?: number;
  networkState?: NetworkState;
}

export interface AIEvaluationStats {
  generation: number;
  aliveCount: number;
  totalPopulation: number;
  bestFitness: number;
  crashes: number;
}
