import { Game } from '../core/game';
import type { InputState } from '../core/types';
import type { AIMode } from './types';
import { MathPolicies } from './policies';
import { NeuralNetwork } from './ann';

export interface BenchmarkResult {
  totalLevels: number;
  passedCount: number;
  failedCount: number;
  passPercentage: number;
  avgScore: number;
  durationMs: number;
}

export class LevelBenchmark {
  private ann: NeuralNetwork;

  constructor() {
    this.ann = new NeuralNetwork();
  }

  run(
    mode: AIMode,
    totalLevels: number = 1000,
    maxFramesPerLevel: number = 1500,
    onProgress?: (completed: number, passed: number) => void
  ): BenchmarkResult {
    const t0 = performance.now();
    let passed = 0;
    let totalScore = 0;

    for (let seed = 1; seed <= totalLevels; seed++) {
      const game = new Game(seed * 7919, 0);
      let frames = 0;

      // Start game
      game.step({ jumpPressed: true, jumpHeld: false, duckHeld: false, restartPressed: false }, 1);
      while (game.phase === 'INTRO') {
        game.step({ jumpPressed: false, jumpHeld: false, duckHeld: false, restartPressed: false }, 1);
      }

      while (game.state.phase === 'RUNNING' && frames < maxFramesPerLevel) {
        frames++;
        let action: 'NONE' | 'JUMP' | 'DUCK' = 'NONE';

        if (mode === 'NAIVE') {
          action = MathPolicies.evaluateNaive(game.state).action;
        } else if (mode === 'LINEAR') {
          action = MathPolicies.evaluateLinear(game.state).action;
        } else if (mode === 'ANN' || mode === 'EVOLUTION') {
          action = this.ann.evaluate(game.state).action;
        }

        const input: InputState = {
          jumpPressed: action === 'JUMP',
          jumpHeld: action === 'JUMP',
          duckHeld: action === 'DUCK',
          restartPressed: false,
        };

        game.step(input, 1);
      }

      totalScore += game.state.score;
      if (game.state.phase === 'RUNNING' && frames >= maxFramesPerLevel) {
        passed++;
      }

      if (seed % 50 === 0 && onProgress) {
        onProgress(seed, passed);
      }
    }

    const t1 = performance.now();
    return {
      totalLevels,
      passedCount: passed,
      failedCount: totalLevels - passed,
      passPercentage: Number(((passed / totalLevels) * 100).toFixed(1)),
      avgScore: Math.round(totalScore / totalLevels),
      durationMs: Math.round(t1 - t0),
    };
  }
}
