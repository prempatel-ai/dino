import type { GameState, InputState } from '../core/types';
import type { AIMode, AIDecision, AIEvaluationStats } from './types';
import { MathPolicies } from './policies';
import { NeuralNetwork } from './ann';
import { EvolutionManager } from './evolution';

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
    const modes: AIMode[] = ['OFF', 'NAIVE', 'LINEAR', 'ANN', 'EVOLUTION'];
    const idx = modes.indexOf(this.mode);
    const nextMode = modes[(idx + 1) % modes.length];
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
}
