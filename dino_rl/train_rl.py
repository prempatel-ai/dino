#!/usr/bin/env python3
"""
Deep Reinforcement Learning (DQN) Trainer for Dino
Built with PyTorch. Compatible with Hugging Face Deep RL Course Units 0 & 1.

Usage:
    python dino_rl/train_rl.py --episodes 60 --save dino_rl_model.pt
"""

import os
import sys
import argparse
import random
from collections import deque
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dino_env import DinoEnv


# -----------------------------------------------------------------------------
# Deep Q-Network Architecture (7 Inputs -> 64 -> 64 -> 3 Actions)
# -----------------------------------------------------------------------------
class DinoDQN(nn.Module):
    def __init__(self, state_dim: int = 7, action_dim: int = 3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


# -----------------------------------------------------------------------------
# Experience Replay Buffer
# -----------------------------------------------------------------------------
class ReplayBuffer:
    def __init__(self, capacity: int = 30000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            np.array(states, dtype=np.float32),
            np.array(actions, dtype=np.int64),
            np.array(rewards, dtype=np.float32),
            np.array(next_states, dtype=np.float32),
            np.array(dones, dtype=np.bool_),
        )

    def __len__(self):
        return len(self.buffer)


def normalize_obs(obs: np.ndarray) -> np.ndarray:
    return np.array([
        obs[0] / 600.0,
        obs[1] / 100.0,
        obs[2] / 100.0,
        obs[3] / 150.0,
        obs[4] / 100.0,
        obs[5] / 20.0,
        obs[6] / 20.0,
    ], dtype=np.float32)


# -----------------------------------------------------------------------------
# Training Engine
# -----------------------------------------------------------------------------
def train_rl(
    num_episodes: int = 60,
    batch_size: int = 64,
    gamma: float = 0.99,
    lr: float = 1e-3,
    save_path: str = "dino_rl_model.pt",
    train_freq: int = 4
):
    print("=" * 65, flush=True)
    print("  DEEP REINFORCEMENT LEARNING TRAINER (PyTorch / HF Deep RL)", flush=True)
    print(f"  Training for {num_episodes} episodes on DinoEnv...", flush=True)
    print("=" * 65, flush=True)

    device = torch.device("cpu")
    policy_net = DinoDQN(7, 3).to(device)
    target_net = DinoDQN(7, 3).to(device)
    target_net.load_state_dict(policy_net.state_dict())
    target_net.eval()

    optimizer = optim.Adam(policy_net.parameters(), lr=lr)
    loss_fn = nn.SmoothL1Loss()
    replay = ReplayBuffer(30000)

    # Pre-populate replay buffer with random exploration
    print("[*] Pre-populating replay buffer with exploration transitions...", flush=True)
    init_env = DinoEnv(ghost_mode=True, max_steps=1000)
    raw_obs, _ = init_env.reset(seed=999)
    state = normalize_obs(raw_obs)
    for _ in range(800):
        action = init_env.action_space.sample()
        next_raw, reward, term, trunc, _ = init_env.step(action)
        done = term or trunc
        replay.push(state, action, reward, normalize_obs(next_raw), done)
        if done:
            raw_obs, _ = init_env.reset()
            state = normalize_obs(raw_obs)
        else:
            state = normalize_obs(next_raw)

    print(f"[+] Replay buffer initialized with {len(replay)} transitions.", flush=True)

    env = DinoEnv(ghost_mode=True, max_steps=1500)
    epsilon = 1.0
    epsilon_min = 0.05
    epsilon_decay = 0.95

    scores = []
    step_count = 0

    for ep in range(1, num_episodes + 1):
        if ep > int(num_episodes * 0.7):
            env.ghost_mode = False  # Harden agent without ghost mode

        raw_obs, _ = env.reset(seed=ep * 13)
        state = normalize_obs(raw_obs)
        total_reward = 0.0
        done = False

        while not done:
            step_count += 1
            if random.random() < epsilon:
                action = env.action_space.sample()
            else:
                with torch.no_grad():
                    s_tensor = torch.FloatTensor(state).unsqueeze(0).to(device)
                    q_vals = policy_net(s_tensor)
                    action = int(torch.argmax(q_vals, dim=1).item())

            next_raw_obs, reward, terminated, truncated, info = env.step(action)
            next_state = normalize_obs(next_raw_obs)
            done = terminated or truncated

            # Reward shaping
            shaped_reward = reward
            if terminated:
                shaped_reward = -10.0

            replay.push(state, action, shaped_reward, next_state, done)
            state = next_state
            total_reward += reward

            # Train network every train_freq steps
            if step_count % train_freq == 0 and len(replay) >= batch_size:
                b_states, b_actions, b_rewards, b_next_states, b_dones = replay.sample(batch_size)

                s_t = torch.FloatTensor(b_states).to(device)
                a_t = torch.LongTensor(b_actions).unsqueeze(1).to(device)
                r_t = torch.FloatTensor(b_rewards).unsqueeze(1).to(device)
                ns_t = torch.FloatTensor(b_next_states).to(device)
                d_t = torch.FloatTensor(b_dones.astype(np.float32)).unsqueeze(1).to(device)

                current_q = policy_net(s_t).gather(1, a_t)

                with torch.no_grad():
                    max_next_q = target_net(ns_t).max(1)[0].unsqueeze(1)
                    target_q = r_t + (1.0 - d_t) * gamma * max_next_q

                loss = loss_fn(current_q, target_q)
                optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(policy_net.parameters(), 1.0)
                optimizer.step()

        scores.append(info.get("score", 0))
        epsilon = max(epsilon_min, epsilon * epsilon_decay)

        # Update target network periodically
        if ep % 4 == 0:
            target_net.load_state_dict(policy_net.state_dict())

        if ep % 5 == 0 or ep == num_episodes:
            recent_avg = np.mean(scores[-5:])
            print(f"  Episode {ep:2d}/{num_episodes} | Avg Score: {recent_avg:5.1f} | Epsilon: {epsilon:.3f} | Buffer: {len(replay)}", flush=True)

    # Save model weights
    torch.save(policy_net.state_dict(), save_path)
    print("=" * 65, flush=True)
    print(f"[+] Model saved to: {save_path}", flush=True)
    print("\nNext step: Run 1,000-level evaluation on trained RL model:", flush=True)
    print(f"    python dino_rl/benchmark_1000.py --policy rl --model {save_path}", flush=True)
    print("=" * 65, flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--episodes", type=int, default=40, help="Number of training episodes")
    parser.add_argument("--save", type=str, default="dino_rl_model.pt", help="Path to save weights")
    args = parser.parse_args()

    train_rl(num_episodes=args.episodes, save_path=args.save)
