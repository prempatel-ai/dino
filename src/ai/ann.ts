import type { GameState, ObstacleState } from '../core/types';
import type { AIDecision, NetworkState } from './types';
import { MathPolicies } from './policies';

export interface NetworkWeights {
  w1: number[][]; // 7 x 8
  b1: number[];   // 8
  w2: number[][]; // 8 x 3
  b2: number[];   // 3
}

export class NeuralNetwork {
  readonly inputSize = 7;
  readonly hiddenSize = 8;
  readonly outputSize = 3; // 0 = NONE, 1 = JUMP, 2 = DUCK

  w1: number[][];
  b1: number[];
  w2: number[][];
  b2: number[];

  constructor(weights?: NetworkWeights) {
    if (weights) {
      this.w1 = weights.w1.map((row) => [...row]);
      this.b1 = [...weights.b1];
      this.w2 = weights.w2.map((row) => [...row]);
      this.b2 = [...weights.b2];
    } else {
      // Default pre-trained champion weights (88.1% clear rate across 1,000 levels)
      this.w1 = this.createDefaultW1();
      this.b1 = [0.0, 0.0, 0.0, 0.0, 0.0, 0.2969, 0.0, 0.0];
      this.w2 = this.createDefaultW2();
      this.b2 = [-0.2, 0.5, 0.2];
    }
  }

  loadWeights(weights: NetworkWeights): void {
    if (weights.w1 && weights.w1.length === this.inputSize) {
      this.w1 = weights.w1.map((row) => [...row]);
    }
    if (weights.b1 && weights.b1.length === this.hiddenSize) {
      this.b1 = [...weights.b1];
    }
    if (weights.w2 && weights.w2.length === this.hiddenSize) {
      this.w2 = weights.w2.map((row) => [...row]);
    }
    if (weights.b2 && weights.b2.length === this.outputSize) {
      this.b2 = [...weights.b2];
    }
  }

  exportWeights(): NetworkWeights {
    return {
      w1: this.w1.map((row) => [...row]),
      b1: [...this.b1],
      w2: this.w2.map((row) => [...row]),
      b2: [...this.b2],
    };
  }

  private createDefaultW1(): number[][] {
    // 7 inputs x 8 hidden neurons (trained model: 88.1% clear rate)
    return [
      [-3.0013, -3.2, 1.5, -4.0, -0.2442, 0.0, -1.5, 2.0],
      [0.3252, 0.2459, 0.2623, 0.1611, -0.8395, 0.2085, 0.1909, -0.3732],
      [0.1926, 0.0312, -0.3435, 0.9347, 0.7071, -0.0075, -0.247, 0.1992],
      [-0.3089, -0.4098, -0.711, 0.2907, -0.2242, 0.2872, -0.1219, 0.2089],
      [0.2772, 0.0773, 0.1135, 0.3939, 0.0967, 0.3384, 0.8071, -0.0606],
      [-0.714, -0.1674, -0.2466, 0.1928, -0.679, -0.1123, 0.3145, -0.7255],
      [1.8, 2.2, 0.185, 2.5, 0.0, 0.0791, 1.0488, 0.0],
    ];
  }

  private createDefaultW2(): number[][] {
    // 8 hidden x 3 outputs: [NONE, JUMP, DUCK]
    return [
      [-0.2517, 2.5, -0.1166],
      [1.1294, 2.2, 0.3894],
      [-0.0328, -1.3789, -0.0046],
      [-0.2085, 1.6966, 0.2579],
      [0.4189, -1.0, -0.9426],
      [0.2873, -0.5, -0.339],
      [-0.0646, 1.4689, 0.3967],
      [0.0908, -0.5, 0.133],
    ];
  }

  /**
   * Extract normalized 7-feature observation vector from GameState
   */
  static extractFeatures(state: GameState): { features: number[]; obs: ObstacleState | null; distance: number } {
    const { obs, distance } = MathPolicies.getNearestObstacle(state);
    const trex = state.trex;
    const speed = state.speed;

    const normDistance = obs ? Math.min(1.0, Math.max(0.0, distance / 600)) : 1.0;
    const normWidth = obs ? obs.w / 100 : 0.0;
    const normHeight = obs ? obs.h / 100 : 0.0;
    const normElevation = obs ? obs.y / 150 : 0.0;
    const normDinoY = trex.y / 100;
    const normDinoV = (trex.jumping ? 1.0 : 0.0);
    const normSpeed = speed / 20;

    return {
      features: [normDistance, normWidth, normHeight, normElevation, normDinoY, normDinoV, normSpeed],
      obs,
      distance,
    };
  }

  /**
   * Forward pass: 7 inputs -> ReLU hidden -> 3 output logits
   */
  predict(inputs: number[]): NetworkState {
    // Hidden layer with ReLU
    const hidden = new Array(this.hiddenSize).fill(0);
    for (let j = 0; j < this.hiddenSize; j++) {
      let sum = this.b1[j];
      for (let i = 0; i < this.inputSize; i++) {
        sum += inputs[i] * this.w1[i][j];
      }
      hidden[j] = Math.max(0, sum); // ReLU
    }

    // Output logits
    const logits = new Array(this.outputSize).fill(0);
    for (let k = 0; k < this.outputSize; k++) {
      let sum = this.b2[k];
      for (let j = 0; j < this.hiddenSize; j++) {
        sum += hidden[j] * this.w2[j][k];
      }
      logits[k] = sum;
    }

    // Softmax for confidence
    const maxLogit = Math.max(...logits);
    const exps = logits.map((l) => Math.exp(l - maxLogit));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map((e) => e / sumExps);

    let actionIndex = 0;
    let maxVal = -Infinity;
    for (let k = 0; k < this.outputSize; k++) {
      if (logits[k] > maxVal) {
        maxVal = logits[k];
        actionIndex = k;
      }
    }

    return {
      inputs,
      hidden,
      outputs: probs,
      logits,
      actionIndex,
      confidence: probs[actionIndex],
      w1: this.w1,
      w2: this.w2,
    };
  }

  evaluate(state: GameState): AIDecision {
    const { features, obs, distance } = NeuralNetwork.extractFeatures(state);
    const networkState = this.predict(features);

    let action: 'NONE' | 'JUMP' | 'DUCK' = 'NONE';
    if (networkState.actionIndex === 1) action = 'JUMP';
    else if (networkState.actionIndex === 2) action = 'DUCK';

    return {
      action,
      targetObs: obs || undefined,
      distance: obs ? distance : undefined,
      features,
      confidence: networkState.confidence,
      networkState,
    };
  }

  /**
   * Clone this neural network
   */
  clone(): NeuralNetwork {
    return new NeuralNetwork({
      w1: this.w1.map((r) => [...r]),
      b1: [...this.b1],
      w2: this.w2.map((r) => [...r]),
      b2: [...this.b2],
    });
  }

  /**
   * Mutate weights for neuroevolution
   */
  mutate(rate: number = 0.1, sigma: number = 0.2): void {
    const randn = (): number => {
      let u = 0;
      let v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        if (Math.random() < rate) {
          this.w1[i][j] += randn() * sigma;
        }
      }
    }

    for (let j = 0; j < this.hiddenSize; j++) {
      if (Math.random() < rate) {
        this.b1[j] += randn() * sigma;
      }
    }

    for (let j = 0; j < this.hiddenSize; j++) {
      for (let k = 0; k < this.outputSize; k++) {
        if (Math.random() < rate) {
          this.w2[j][k] += randn() * sigma;
        }
      }
    }

    for (let k = 0; k < this.outputSize; k++) {
      if (Math.random() < rate) {
        this.b2[k] += randn() * sigma;
      }
    }
  }
}
