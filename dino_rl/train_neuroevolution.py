"""
Neuroevolution Genetic Algorithm (GA) Trainer for Dino Neural Network
Evolves a population of 7->8->3 neural networks across game simulations.
Exports elite genome to 'neuroevo_weights.json' for loading into the Dino Game Neural Deck.
Zero non-standard dependencies: requires only numpy.
"""

import json
import random
import argparse
from typing import List, Dict, Any, Tuple
import numpy as np

from dino_env import DinoEnv


class Genome:
    def __init__(self, in_features: int = 7, hidden_dim: int = 8, out_actions: int = 3):
        self.in_features = in_features
        self.hidden_dim = hidden_dim
        self.out_actions = out_actions

        # Weights: w1 (7, 8), b1 (8,), w2 (8, 3), b2 (3,)
        self.w1 = np.random.randn(in_features, hidden_dim) * 0.5
        self.b1 = np.zeros(hidden_dim)
        self.w2 = np.random.randn(hidden_dim, out_actions) * 0.5
        self.b2 = np.array([-0.2, 0.5, 0.2], dtype=np.float64)

        self.fitness = 0.0

    def predict(self, inputs: np.ndarray) -> int:
        h = np.maximum(0, np.dot(inputs, self.w1) + self.b1)  # ReLU
        logits = np.dot(h, self.w2) + self.b2
        return int(np.argmax(logits))

    def clone(self) -> "Genome":
        child = Genome(self.in_features, self.hidden_dim, self.out_actions)
        child.w1 = np.copy(self.w1)
        child.b1 = np.copy(self.b1)
        child.w2 = np.copy(self.w2)
        child.b2 = np.copy(self.b2)
        return child

    def mutate(self, rate: float = 0.15, sigma: float = 0.3):
        for arr in [self.w1, self.b1, self.w2, self.b2]:
            mask = np.random.rand(*arr.shape) < rate
            arr[mask] += np.random.randn(*arr.shape)[mask] * sigma

    def export_weights(self) -> Dict[str, Any]:
        return {
            "type": "neuroevo",
            "modelType": "EVOLUTION",
            "w1": [[round(float(v), 4) for v in row] for row in self.w1],
            "b1": [round(float(v), 4) for v in self.b1],
            "w2": [[round(float(v), 4) for v in row] for row in self.w2],
            "b2": [round(float(v), 4) for v in self.b2],
            "fitness": round(float(self.fitness), 1),
        }


def normalize_obs(obs: np.ndarray) -> np.ndarray:
    dist, w, h, elev, dino_y, dino_vy, speed = obs
    return np.array([
        min(1.0, max(0.0, dist / 600.0)),
        w / 100.0,
        h / 100.0,
        elev / 150.0,
        dino_y / 100.0,
        1.0 if dino_y > 1.0 or dino_vy != 0 else 0.0,
        speed / 20.0,
    ], dtype=np.float64)


def evaluate_genome(genome: Genome, seeds: List[int], max_steps: int = 1500) -> float:
    total_steps = 0
    crashes = 0

    for s in seeds:
        env = DinoEnv(start_speed=11.0, max_steps=max_steps)
        obs, _ = env.reset(seed=s)
        steps = 0
        while steps < max_steps:
            norm_in = normalize_obs(obs)
            action = genome.predict(norm_in)
            obs, _, term, _, _ = env.step(action)
            steps += 1
            if term:
                crashes += 1
                break
        total_steps += steps

    # Fitness: average steps survived minus crash penalty
    avg_steps = total_steps / len(seeds)
    return avg_steps - (crashes * 30.0)


def train_neuroevolution(
    pop_size: int = 30,
    generations: int = 15,
    eval_seeds_count: int = 5,
    max_steps: int = 1200,
) -> Dict[str, Any]:
    print(f"[*] Initializing Neuroevolution Population ({pop_size} genomes, {generations} generations)...")

    population = [Genome() for _ in range(pop_size)]

    # Seed an initial elite with expert weights
    expert = population[0]
    expert.w1[0] = [-2.8, -3.2, 1.5, -4.0, 0.0, 0.0, -1.5, 2.0]  # distance
    expert.w1[6] = [1.8, 2.2, 0.0, 2.5, 0.0, 0.0, 1.2, 0.0]     # speed
    expert.w2[:, 1] = [2.5, 2.2, -1.0, 2.0, -1.0, -0.5, 1.2, -0.5]  # jump column

    best_genome = expert
    best_fitness = -float("inf")

    for gen in range(1, generations + 1):
        test_seeds = [random.randint(1, 5000) for _ in range(eval_seeds_count)]

        # Evaluate population
        for g in population:
            g.fitness = evaluate_genome(g, test_seeds, max_steps=max_steps)

        # Sort descending by fitness
        population.sort(key=lambda x: x.fitness, reverse=True)

        current_best = population[0]
        if current_best.fitness > best_fitness:
            best_fitness = current_best.fitness
            best_genome = current_best.clone()
            best_genome.fitness = current_best.fitness

        avg_fit = sum(g.fitness for g in population) / len(population)
        print(f"  [Gen {gen:02d}/{generations}] Best Fitness: {current_best.fitness:6.1f} | Avg: {avg_fit:6.1f} | Top Genome Survived: {current_best.fitness + (current_best.fitness < max_steps)*30:.0f} steps")

        # Create next generation
        new_pop = []
        # Elitism: top 3 unchanged
        new_pop.append(population[0].clone())
        new_pop.append(population[1].clone())
        new_pop.append(population[2].clone())

        # Fill rest through tournament selection & mutation
        while len(new_pop) < pop_size:
            # Tournament of 3
            k_candidates = random.sample(population[:15], 3)
            parent = max(k_candidates, key=lambda x: x.fitness)
            child = parent.clone()
            child.mutate(rate=0.20, sigma=0.35)
            new_pop.append(child)

        population = new_pop

    weights_json = best_genome.export_weights()
    with open("neuroevo_weights.json", "w") as f:
        json.dump(weights_json, f, indent=2)
    print("\n[*] Successfully exported elite neuroevolution genome to 'neuroevo_weights.json'!")

    # Verify on 100 benchmark levels
    print("[*] Evaluating elite genome on 100 test seeds...")
    passed = 0
    for s in range(1, 101):
        env = DinoEnv(start_speed=12.0, max_steps=1200)
        obs, _ = env.reset(seed=s)
        crashed = False
        for _ in range(1200):
            act = best_genome.predict(normalize_obs(obs))
            obs, _, term, _, _ = env.step(act)
            if term:
                crashed = True
                break
        if not crashed:
            passed += 1

    print(f"[*] Neuroevolution Benchmark: {passed}/100 levels passed ({passed}%).")
    return weights_json


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--pop-size", type=int, default=25)
    parser.add_argument("--generations", type=int, default=12)
    args = parser.parse_args()

    train_neuroevolution(pop_size=args.pop_size, generations=args.generations)
