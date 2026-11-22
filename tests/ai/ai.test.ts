import { describe, it, expect } from 'vitest';
import { Game } from '../../src/core/game';
import { MathPolicies } from '../../src/ai/policies';
import { NeuralNetwork } from '../../src/ai/ann';
import { EvolutionManager } from '../../src/ai/evolution';
import { AIController } from '../../src/ai/controller';
import { LevelBenchmark } from '../../src/ai/benchmark';

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
    expect(controller.cycleMode()).toBe('LINEAR');
    expect(controller.cycleMode()).toBe('ANN');
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

  it('LevelBenchmark executes batch seeds and returns valid stats', () => {
    const bench = new LevelBenchmark();
    const result = bench.run('LINEAR', 10, 300);
    expect(result.totalLevels).toBe(10);
    expect(result.passedCount).toBeGreaterThanOrEqual(8);
    expect(result.passPercentage).toBeGreaterThanOrEqual(80);
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it('AIController loads custom trained weights for MLP, Linear, and Master Bundle', () => {
    const controller = new AIController();

    // 1. Test Linear Weights
    const linRes = controller.loadWeights({ a: 15.2, c: -10.5, duckElev: 75, duckDist: 18 });
    expect(linRes.success).toBe(true);
    expect(linRes.modelType).toBe('LINEAR');
    expect(controller.mode).toBe('LINEAR');
    expect(MathPolicies.getLinearParameters().a).toBe(15.2);
    expect(MathPolicies.getLinearParameters().c).toBe(-10.5);

    // 2. Test MLP Weights
    const dummyMLP = {
      w1: Array.from({ length: 7 }, () => Array(8).fill(0.1)),
      b1: Array(8).fill(0.05),
      w2: Array.from({ length: 8 }, () => Array(3).fill(0.2)),
      b2: [0.1, 0.5, 0.1],
    };
    const mlpRes = controller.loadWeights(dummyMLP);
    expect(mlpRes.success).toBe(true);
    expect(mlpRes.modelType).toBe('ANN');
    expect(controller.mode).toBe('ANN');

    // 3. Test Master Bundle Export and Re-load
    const exported = controller.exportAllWeights();
    expect(exported.version).toBe('1.0');
    expect(exported.linear).toBeDefined();
    expect(exported.mlp).toBeDefined();
    expect(exported.neuroevo).toBeDefined();

    const bundleRes = controller.loadWeights(exported);
    expect(bundleRes.success).toBe(true);
    expect(bundleRes.modelType).toBe('BUNDLE');
  });

  it('Trained ANN champion weights never randomly duck or jump on empty tracks', () => {
    const net = new NeuralNetwork();
    // Test empty track across multiple distances and speeds
    for (const dist of [1.0, 0.8, 0.6, 0.5]) {
      for (const spd of [0.3, 0.4, 0.5, 0.65]) {
        // [normDist, normWidth, normHeight, normElevation, normDinoY, normDinoV, normSpeed]
        const pred = net.predict([dist, 0.0, 0.0, 0.0, 0.93, 0.0, spd]);
        expect(pred.actionIndex).toBe(0); // 0 = RUN (NONE)
        expect(pred.logits[0]).toBeGreaterThan(pred.logits[1]); // RUN > JUMP
        expect(pred.logits[0]).toBeGreaterThan(pred.logits[2]); // RUN > DUCK
      }
    }
  });

  it('Trained ANN champion weights correctly handle ground cacti and airborne birds', () => {
    const net = new NeuralNetwork();

    // 1. Ground Cactus Approaching (normDist = 0.12, normElev = 0.60) -> MUST JUMP
    const cactusPred = net.predict([0.12, 0.25, 0.50, 0.60, 0.93, 0.0, 0.40]);
    expect(cactusPred.actionIndex).toBe(1); // 1 = JUMP
    expect(cactusPred.logits[1]).toBeGreaterThan(cactusPred.logits[0]);
    expect(cactusPred.logits[1]).toBeGreaterThan(cactusPred.logits[2]);

    // 2. Mid Bird Approaching (normDist = 0.12, normElev = 0.50) -> MUST DUCK
    const midBirdPred = net.predict([0.12, 0.46, 0.40, 0.50, 0.93, 0.0, 0.40]);
    expect(midBirdPred.actionIndex).toBe(2); // 2 = DUCK
    expect(midBirdPred.logits[2]).toBeGreaterThan(midBirdPred.logits[0]);
    expect(midBirdPred.logits[2]).toBeGreaterThan(midBirdPred.logits[1]);

    // 3. High Bird Approaching (normDist = 0.12, normElev = 0.33) -> MUST RUN (NEVER JUMP)
    const highBirdPred = net.predict([0.12, 0.46, 0.40, 0.33, 0.93, 0.0, 0.40]);
    expect(highBirdPred.actionIndex).toBe(0); // 0 = RUN
    expect(highBirdPred.logits[1]).toBeLessThan(0); // JUMP is heavily suppressed
  });

  it('Trained ANN mode survives 1500 steps continuously on level seed', () => {
    const game = new Game(1234);
    const controller = new AIController();
    controller.setMode('ANN');

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
