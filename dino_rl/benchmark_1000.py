#!/usr/bin/env python3
"""
1,000-Level Benchmark Harness for Dino AI
Evaluates any policy (pure if-statement or RL agent) across 1,000 unique, reproducible levels.

Usage:
    python benchmark_1000.py --policy custom   # Test your custom_policy.py if-statements
    python benchmark_1000.py --policy naive    # Test naive if-statement (11 * speed)
    python benchmark_1000.py --policy linear   # Test 3-Byte evolved model (14.5*S - 12.9)
    python benchmark_1000.py --policy rl       # Test trained PyTorch RL agent
"""

import sys
import os
import argparse
import time
import numpy as np

# Ensure dino_rl directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dino_env import DinoEnv


class NaiveIfPolicy:
    """Stage 1: Pure Naive If-Statement Heuristic (if dist < 11 * speed: jump)"""
    def act(self, obs) -> int:
        dist, w, h, elev, dino_y, dino_vy, speed = obs
        # Naive rule without pterodactyl ducking or multi-cactus width compensation
        if dist < 11.0 * speed:
            return 1  # Jump
        return 0


class Linear3BytePolicy:
    """Pure Logic Policy (15.5 * speed - 10.0 + bird ducking)"""
    def act(self, obs) -> int:
        dist, w, h, elev, dino_y, dino_vy, speed = obs
        if 40 < elev < 85 and dist < speed * 14.0 and dist > -w:
            return 2  # Duck
        if dist < (15.5 * speed - 10.0):
            return 1  # Jump
        return 0


class PyTorchRLPolicy:
    """Trained Deep RL Agent Policy"""
    def __init__(self, model_path: str = "dino_rl_model.pt"):
        import torch
        import torch.nn as nn

        class DinoActorCritic(nn.Module):
            def __init__(self):
                super().__init__()
                self.net = nn.Sequential(
                    nn.Linear(7, 64),
                    nn.ReLU(),
                    nn.Linear(64, 64),
                    nn.ReLU(),
                    nn.Linear(64, 3)
                )

            def forward(self, x):
                return self.net(x)

        self.device = torch.device("cpu")
        self.model = DinoActorCritic().to(self.device)

        if os.path.exists(model_path):
            state = torch.load(model_path, map_location=self.device, weights_only=True)
            self.model.load_state_dict(state)
            self.model.eval()
            print(f"[+] Loaded trained RL weights from: {model_path}")
        else:
            print(f"[!] Warning: Model file '{model_path}' not found! Using initialized weights.")

    def act(self, obs) -> int:
        import torch
        norm = np.array([
            obs[0] / 600.0,
            obs[1] / 100.0,
            obs[2] / 100.0,
            obs[3] / 150.0,
            obs[4] / 100.0,
            obs[5] / 20.0,
            obs[6] / 20.0,
        ], dtype=np.float32)
        with torch.no_grad():
            t = torch.FloatTensor(norm).unsqueeze(0)
            logits = self.model(t)
            return int(torch.argmax(logits, dim=1).item())


def run_1000_benchmark(policy, num_levels: int = 1000, max_steps: int = 1500, start_speed: float = 12.0):
    print("=" * 65)
    print(f"  RUNNING {num_levels}-LEVEL BENCHMARK TEST SUITE")
    print(f"  Speed: {start_speed:.1f} px/f (High/Top Speed) | Target: {max_steps} frames/level")
    print("=" * 65)

    env = DinoEnv(ghost_mode=False, max_steps=max_steps, start_speed=start_speed)
    passed_levels = []
    failed_levels = []
    scores = []
    start_time = time.time()

    for seed in range(1, num_levels + 1):
        obs, _ = env.reset(seed=seed)
        terminated = False
        truncated = False

        while not (terminated or truncated):
            action = policy.act(obs)
            obs, reward, terminated, truncated, info = env.step(action)

        score = info.get("score", 0)
        scores.append(score)

        if truncated and not terminated:
            passed_levels.append(seed)
        else:
            failed_levels.append((seed, score, env.speed))

        # Live terminal progress bar
        if seed % 25 == 0 or seed == num_levels:
            progress = seed / num_levels
            bar_len = 30
            filled = int(bar_len * progress)
            bar = "█" * filled + "░" * (bar_len - filled)
            pct = (len(passed_levels) / seed) * 100.0
            elapsed = time.time() - start_time
            print(f"\r  [{bar}] {seed}/{num_levels} levels | Pass Rate: {pct:5.1f}% | {elapsed:.1f}s", end="", flush=True)

    print("\n" + "=" * 65)
    pass_count = len(passed_levels)
    fail_count = len(failed_levels)
    pass_pct = (pass_count / num_levels) * 100.0
    avg_score = float(np.mean(scores)) if scores else 0.0

    print("  BENCHMARK RESULTS SUMMARY:")
    print(f"  Total Test Cases : {num_levels}")
    print(f"  Levels PASSED    : {pass_count} / {num_levels} ({pass_pct:.2f}%)")
    print(f"  Levels FAILED    : {fail_count} / {num_levels} ({100.0 - pass_pct:.2f}%)")
    print(f"  Average Score    : {avg_score:.1f} pts")

    if fail_count > 0:
        print("\n  Sample Crashed Levels (seed, score reached, speed):")
        for f_seed, f_score, f_spd in failed_levels[:5]:
            print(f"    - Level Seed #{f_seed:4d}: Crashed at score {f_score:3d} (speed {f_spd:.1f} px/f)")
        if fail_count > 5:
            print(f"    ... and {fail_count - 5} more.")
    else:
        print("\n  PERFECT 100% CLEAR RATE! All 1,000 unique levels cleared with 0 crashes!")
    print("=" * 65)

    return pass_count, fail_count, pass_pct


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="1,000-Level Dino Benchmark")
    parser.add_argument(
        "--policy",
        type=str,
        default="logic",
        choices=["logic", "ai", "custom", "linear", "rl", "naive"],
        help="Policy to evaluate: 'logic' (Pure Math Logic), 'ai' (Trained AI Model), 'custom' (custom_policy.py)"
    )
    parser.add_argument("--levels", type=int, default=1000, help="Number of levels to test (default: 1000)")
    parser.add_argument("--steps", type=int, default=1500, help="Max steps per level (default: 1500)")
    parser.add_argument("--speed", type=float, default=12.0, help="Starting speed (default: 12.0 for top speed challenge)")
    parser.add_argument("--model", type=str, default="dino_rl_model.pt", help="Path to trained PyTorch weights")

    args = parser.parse_args()

    if args.policy == "custom":
        try:
            import custom_policy
            policy = custom_policy
            print("[*] Loaded custom pure if-statement policy from 'custom_policy.py'")
        except Exception as e:
            print(f"[!] Error loading custom_policy.py: {e}")
            sys.exit(1)
    elif args.policy in ["logic", "linear"]:
        policy = Linear3BytePolicy()
        print("[*] Loaded Pure Logic Policy (15.5 * speed - 10.0)")
    elif args.policy in ["ai", "rl"]:
        policy = PyTorchRLPolicy(model_path=args.model)
        print(f"[*] Loaded Trained AI Model from '{args.model}'")
    elif args.policy == "naive":
        policy = NaiveIfPolicy()
        print("[*] Loaded Naive Jump Heuristic")

    run_1000_benchmark(policy, num_levels=args.levels, max_steps=args.steps, start_speed=args.speed)
