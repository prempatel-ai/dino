import { NeuralNetwork } from './ann';
import type { GameState } from '../core/types';
import type { AIEvaluationStats, AIDecision } from './types';

export interface EvolutionAgent {
  id: number;
  net: NeuralNetwork;
  fitness: number;
  crashes: number;
  isGhost: boolean;
  color: string;
}

export class EvolutionManager {
  readonly populationSize = 10;
  readonly generationFrames = 600; // 10 seconds per generation at 60 FPS
  
  population: EvolutionAgent[] = [];
  generation = 1;
  frameInGen = 0;
  bestFitness = 0;
  bestAgent: EvolutionAgent | null = null;

  constructor() {
    this.initPopulation();
  }

  private initPopulation(): void {
    const colors = [
      '#00ffcc', '#ff0077', '#ffcc00', '#0099ff', '#9933ff',
      '#ff6600', '#33cc33', '#ff3399', '#00e5ff', '#ffea00'
    ];

    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const net = new NeuralNetwork();
      if (i > 0) {
        net.mutate(0.4, 0.5); // diversified initial population
      }
      this.population.push({
        id: i + 1,
        net,
        fitness: 0,
        crashes: 0,
        isGhost: false,
        color: colors[i % colors.length],
      });
    }
  }

  step(state: GameState, hadCrash: boolean): AIDecision {
    this.frameInGen++;

    // Evaluate all agents in parallel
    for (const agent of this.population) {
      if (!agent.isGhost) {
        agent.fitness += 1; // +1 fitness for surviving frame
      } else {
        agent.fitness += 0.2; // diminished fitness while ghosted
      }

      if (hadCrash) {
        agent.crashes += 1;
        agent.isGhost = true;
        agent.fitness = Math.max(0, agent.fitness - 50); // penalty
      }
    }

    // Check generation wrap
    if (this.frameInGen >= this.generationFrames) {
      this.nextGeneration();
    }

    // Use current best agent to make visual decision
    const currentBest = this.getBestAgent();
    return currentBest.net.evaluate(state);
  }

  private nextGeneration(): void {
    // Sort descending by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);

    this.bestAgent = this.population[0];
    this.bestFitness = Math.max(this.bestFitness, this.bestAgent.fitness);

    // Keep top 2 elite
    const elite1 = this.population[0];
    const elite2 = this.population[1];

    const newPop: EvolutionAgent[] = [];

    // Elite 1 (unmutated)
    newPop.push({
      id: 1,
      net: elite1.net.clone(),
      fitness: 0,
      crashes: 0,
      isGhost: false,
      color: elite1.color,
    });

    // Elite 2 (unmutated)
    newPop.push({
      id: 2,
      net: elite2.net.clone(),
      fitness: 0,
      crashes: 0,
      isGhost: false,
      color: elite2.color,
    });

    // Children mutated from elite1 and elite2
    for (let i = 2; i < this.populationSize; i++) {
      const parent = i % 2 === 0 ? elite1 : elite2;
      const childNet = parent.net.clone();
      const mutationStrength = i > 7 ? 0.4 : 0.15;
      childNet.mutate(0.2, mutationStrength);

      newPop.push({
        id: i + 1,
        net: childNet,
        fitness: 0,
        crashes: 0,
        isGhost: false,
        color: this.population[i].color,
      });
    }

    this.population = newPop;
    this.generation++;
    this.frameInGen = 0;
  }

  getBestAgent(): EvolutionAgent {
    return this.population.reduce((best, curr) => (curr.fitness > best.fitness ? curr : best), this.population[0]);
  }

  getStats(): AIEvaluationStats {
    const alive = this.population.filter((a) => !a.isGhost).length;
    const totalCrashes = this.population.reduce((sum, a) => sum + a.crashes, 0);

    return {
      generation: this.generation,
      aliveCount: alive,
      totalPopulation: this.populationSize,
      bestFitness: Math.round(this.bestFitness),
      crashes: totalCrashes,
    };
  }

  reset(): void {
    this.generation = 1;
    this.frameInGen = 0;
    this.bestFitness = 0;
    this.initPopulation();
  }
}
