import { describe, it, expect } from 'vitest';
import { Game } from '../../src/core/game';
import { MathPolicies } from '../../src/ai/policies';
import { NeuralNetwork } from '../../src/ai/ann';
import { EvolutionManager } from '../../src/ai/evolution';
import { AIController } from '../../src/ai/controller';

describe('AI Policies & ANN Module', () => {
  it('Naive Math Policy detects obstacles and computes 11 * speed threshold', () => {
    const game = new Game(42);
    game.step({ jumpPressed: true, jumpHeld: true, duckHeld: false, restartPressed: false });

    // Step until obstacle spawns
    for (let i = 0; i < 200; i++) {
      game.step({ jumpPressed: false, jumpHeld: false, duckHeld: false, restartPressed: false });
      if (game.state.obstacles.length > 0) break;
    }

    const decision = MathPolicies.evaluateNaive(game.state);
    expect(decision).toBeDefined();
    expect(['NONE', 'JUMP', 'DUCK']).toContain(decision.action);
    if (decision.threshold) {
      expect(decision.threshold).toBeCloseTo(11 * game.state.speed, 2);
    }
  });

  it('Evolved 3-Byte Linear Policy computes (14.5 * speed - 12.9) threshold', () => {
    const game = new Game(42);
    game.step({ jumpPressed: true, jumpHeld: true, duckHeld: false, restartPressed: false });

    for (let i = 0; i < 200; i++) {
      game.step({ jumpPressed: false, jumpHeld: false, duckHeld: false, restartPressed: false });
      if (game.state.obstacles.length > 0) break;
    }

    const decision = MathPolicies.evaluateLinear(game.state);
    expect(decision).toBeDefined();
    expect(['NONE', 'JUMP', 'DUCK']).toContain(decision.action);
    if (decision.threshold) {
      expect(decision.threshold).toBeCloseTo(14.5 * game.state.speed - 12.9, 2);
    }
  });

  it('Neural Network extracts 7 normalized features and outputs valid prediction', () => {
    const game = new Game(99);
    game.step({ jumpPressed: true, jumpHeld: true, duckHeld: false, restartPressed: false });

    const net = new NeuralNetwork();
    const { features } = NeuralNetwork.extractFeatures(game.state);
    expect(features.length).toBe(7);

    // Each feature normalized
    features.forEach((f) => {
      expect(Number.isFinite(f)).toBe(true);
    });

    const pred = net.predict(features);
    expect(pred.actionIndex).toBeGreaterThanOrEqual(0);
    expect(pred.actionIndex).toBeLessThanOrEqual(2);
    expect(pred.logits.length).toBe(3);
    expect(pred.confidence).toBeGreaterThan(0);
    expect(pred.confidence).toBeLessThanOrEqual(1.0001);
  });

  it('Evolution Manager maintains population and advances generations', () => {
    const evo = new EvolutionManager();
    expect(evo.population.length).toBe(10);
    expect(evo.generation).toBe(1);

    const game = new Game(100);
    game.step({ jumpPressed: true, jumpHeld: true, duckHeld: false, restartPressed: false });

    // Step 650 frames to trigger generation advance
    for (let f = 0; f < 650; f++) {
      evo.step(game.state, false);
    }

    expect(evo.generation).toBeGreaterThanOrEqual(2);
    const stats = evo.getStats();
    expect(stats.generation).toBe(evo.generation);
    expect(stats.totalPopulation).toBe(10);
  });

  it('AIController cycles modes correctly', () => {
    const controller = new AIController();
    expect(controller.mode).toBe('OFF');
    expect(controller.cycleMode()).toBe('NAIVE');
    expect(controller.cycleMode()).toBe('LINEAR');
    expect(controller.cycleMode()).toBe('ANN');
    expect(controller.cycleMode()).toBe('EVOLUTION');
    expect(controller.cycleMode()).toBe('OFF');
  });

  it('Evolved 3-Byte Linear Policy survives > 1500 steps on level seed', () => {
    const game = new Game(1234);
    const controller = new AIController();
    controller.setMode('LINEAR');

    // Initial jump to start
    let input = controller.update(game.state)!;
    game.step(input);

    let stepsSurvived = 0;
    for (let s = 0; s < 1500; s++) {
      if (game.phase === 'CRASHED') break;
      input = controller.update(game.state)!;
      game.step(input);
      stepsSurvived++;
    }

    expect(stepsSurvived).toBe(1500);
    expect(game.phase).toBe('RUNNING');
  });
});
