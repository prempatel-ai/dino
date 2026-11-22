import type { GameState, InputState } from '../core/types';
import type { AIMode, AIDecision, AIEvaluationStats } from './types';
import { MathPolicies } from './policies';
import { NeuralNetwork } from './ann';
import { EvolutionManager } from './evolution';

export interface AILoadResult {
  success: boolean;
  modelType: 'LINEAR' | 'ANN' | 'EVOLUTION' | 'BUNDLE' | 'UNKNOWN';
  message: string;
}

export class AIController {
  mode: AIMode = 'OFF';

  private ann: NeuralNetwork;
  private evolution: EvolutionManager;
  private lastDecision: AIDecision | null = null;
  private wasCrashed = false;

  constructor() {
    this.ann = new NeuralNetwork();
    this.evolution = new EvolutionManager();
  }

  setMode(mode: AIMode): void {
    this.mode = mode;
    if (mode === 'EVOLUTION') {
      this.evolution.reset();
    }
  }

  cycleMode(): AIMode {
    const modes: AIMode[] = ['OFF', 'LINEAR', 'ANN'];
    const idx = modes.indexOf(this.mode);
    const nextMode = idx === -1 ? 'LINEAR' : modes[(idx + 1) % modes.length];
    this.setMode(nextMode);
    return nextMode;
  }

  update(state: GameState): InputState | null {
    if (this.mode === 'OFF') {
      this.lastDecision = null;
      return null;
    }

    const hadCrash = state.phase === 'CRASHED' && !this.wasCrashed;
    this.wasCrashed = state.phase === 'CRASHED';

    let decision: AIDecision;

    switch (this.mode) {
      case 'NAIVE':
        decision = MathPolicies.evaluateNaive(state);
        break;

      case 'LINEAR':
        decision = MathPolicies.evaluateLinear(state);
        break;

      case 'ANN':
        decision = this.ann.evaluate(state);
        break;

      case 'EVOLUTION':
        decision = this.evolution.step(state, hadCrash);
        break;

      default:
        decision = { action: 'NONE' };
    }

    this.lastDecision = decision;

    // Auto-restart if crashed while AI is active
    if (state.phase === 'CRASHED') {
      return {
        jumpPressed: false,
        jumpHeld: false,
        duckHeld: false,
        restartPressed: true,
      };
    }

    // Auto-start if ready
    if (state.phase === 'READY') {
      return {
        jumpPressed: true,
        jumpHeld: true,
        duckHeld: false,
        restartPressed: false,
      };
    }

    const jump = decision.action === 'JUMP';
    const duck = decision.action === 'DUCK';

    return {
      jumpPressed: jump && !state.trex.jumping,
      jumpHeld: jump,
      duckHeld: duck,
      restartPressed: false,
    };
  }

  getLastDecision(): AIDecision | null {
    return this.lastDecision;
  }

  getEvolutionStats(): AIEvaluationStats | null {
    if (this.mode === 'EVOLUTION') {
      return this.evolution.getStats();
    }
    return null;
  }

  loadWeights(payload: unknown): AILoadResult {
    if (!payload || typeof payload !== 'object') {
      return { success: false, modelType: 'UNKNOWN', message: 'Invalid payload: expected JSON object.' };
    }

    const data = payload as Record<string, unknown>;

    // Check if master bundle
    if (data.mlp || data.linear || data.neuroevo) {
      if (data.linear && typeof data.linear === 'object') {
        MathPolicies.setLinearParameters(data.linear as Partial<import('./policies').LinearParameters>);
      }
      if (data.mlp && typeof data.mlp === 'object') {
        this.ann.loadWeights(data.mlp as import('./ann').NetworkWeights);
      }
      if (data.neuroevo && typeof data.neuroevo === 'object') {
        this.evolution.loadBestWeights(data.neuroevo as import('./ann').NetworkWeights);
      }
      return {
        success: true,
        modelType: 'BUNDLE',
        message: 'Successfully loaded trained weights bundle for Linear, MLP, and Neuroevolution!',
      };
    }

    // Check if MLP weights: w1, b1, w2, b2
    if (data.w1 && data.b1 && data.w2 && data.b2) {
      if (data.type === 'neuroevo') {
        this.evolution.loadBestWeights(data as unknown as import('./ann').NetworkWeights);
        this.setMode('EVOLUTION');
        return {
          success: true,
          modelType: 'EVOLUTION',
          message: 'Loaded Neuroevolution elite genome weights into current generation.',
        };
      } else {
        this.ann.loadWeights(data as unknown as import('./ann').NetworkWeights);
        this.setMode('ANN');
        return {
          success: true,
          modelType: 'ANN',
          message: 'Loaded MLP neural network weights and activated ANN mode.',
        };
      }
    }

    // Check if 3-byte linear: a, c
    if (typeof data.a === 'number' && typeof data.c === 'number') {
      MathPolicies.setLinearParameters(data as Partial<import('./policies').LinearParameters>);
      this.setMode('LINEAR');
      return {
        success: true,
        modelType: 'LINEAR',
        message: `Loaded 3-byte linear parameters: ${data.a} * speed + (${data.c}).`,
      };
    }

    return {
      success: false,
      modelType: 'UNKNOWN',
      message: 'Unrecognized weight format. Expected w1/w2 matrices or a/c coefficients.',
    };
  }

  exportAllWeights(): Record<string, unknown> {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      linear: MathPolicies.getLinearParameters(),
      mlp: this.ann.exportWeights(),
      neuroevo: this.evolution.exportBestWeights(),
    };
  }
}
