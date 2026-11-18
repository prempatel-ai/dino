"""
3-Byte Linear Policy Optimizer (Grid & Coordinate Search)
Optimizes the parameters:
  threshold = a * speed + c
  duck_threshold = bird_dist * speed (for pterodactyls)

Evaluates on the reproducible 1,000 seeded levels and exports 'linear_weights.json'.
"""

import json
import argparse
from typing import Dict, Any, Tuple
from dino_env import DinoEnv


def evaluate_candidate(a: float, c: float, duck_dist: float, num_levels: int = 100, max_steps: int = 1500) -> float:
    passed = 0
    for seed in range(1, num_levels + 1):
        env = DinoEnv(start_speed=12.0, max_steps=max_steps)
        obs, _ = env.reset(seed=seed)
        crashed = False

        for _ in range(max_steps):
            dist, obs_w, obs_h, obs_elev, dino_y, dino_vy, speed = obs

            action = 0  # RUN
            if 40 < obs_elev < 85 and dist < speed * duck_dist and dist > -obs_w:
                action = 2  # DUCK
            elif dist < a * speed + c:
                action = 1  # JUMP

            obs, _, terminated, _, _ = env.step(action)
            if terminated:
                crashed = True
                break

        if not crashed:
            passed += 1

    return passed / num_levels


def optimize_linear(eval_levels: int = 100, full_levels: int = 1000) -> Dict[str, Any]:
    print(f"[*] Starting 3-Byte Linear parameter search across {eval_levels} levels...")

    best_a = 14.5
    best_c = -12.9
    best_duck = 16.0
    best_rate = evaluate_candidate(best_a, best_c, best_duck, num_levels=eval_levels)

    print(f"[*] Baseline (a={best_a}, c={best_c}, duck={best_duck}): {best_rate*100:.1f}% pass rate")

    # Fine-tuning grid search around baseline
    a_candidates = [13.5, 14.0, 14.2, 14.5, 14.8, 15.0, 15.5]
    c_candidates = [-18.0, -15.0, -12.9, -10.0, -8.0]
    duck_candidates = [14.0, 16.0, 18.0]

    for a in a_candidates:
        for c in c_candidates:
            for duck in duck_candidates:
                rate = evaluate_candidate(a, c, duck, num_levels=eval_levels)
                if rate > best_rate:
                    best_rate = rate
                    best_a = a
                    best_c = c
                    best_duck = duck
                    print(f"  [+] New Best: a={best_a:.2f}, c={best_c:.2f}, duck={best_duck:.1f} -> {best_rate*100:.1f}%")

    print(f"\n[*] Evaluating final parameters on FULL {full_levels} levels...")
    full_rate = evaluate_candidate(best_a, best_c, best_duck, num_levels=full_levels)
    print(f"[*] Full 1,000-Level Pass Rate: {full_rate*100:.2f}% ({int(full_rate*full_levels)}/{full_levels})")

    result = {
        "modelType": "LINEAR",
        "a": round(best_a, 2),
        "c": round(best_c, 2),
        "duckElev": 75,
        "duckDist": round(best_duck, 1),
        "passRate1000": round(full_rate * 100, 2),
    }

    with open("linear_weights.json", "w") as f:
        json.dump(result, f, indent=2)
    print("[*] Saved optimized 3-byte linear weights to 'linear_weights.json'")

    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--eval-levels", type=int, default=100)
    parser.add_argument("--full-levels", type=int, default=1000)
    args = parser.parse_args()

    optimize_linear(eval_levels=args.eval_levels, full_levels=args.full_levels)
