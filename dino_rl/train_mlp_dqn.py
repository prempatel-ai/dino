"""
PyTorch Deep Q-Network (DQN) Trainer for Dino MLP (7 -> 8 -> 3)
Exports directly to 'mlp_weights.json' for loading into the Dino Game Neural Deck.
Zero non-standard dependencies: requires only torch & numpy.
"""

import json
import random
import argparse
from collections import deque
from typing import List, Tuple, Dict, Any
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from dino_env import DinoEnv


class DinoQNet(nn.Module):
    def __init__(self, in_features: int = 7, hidden_dim: int = 8, out_actions: int = 3):
        super().__init__()
        self.fc1 = nn.Linear(in_features, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, out_actions)

        # Initialize with reasonable jump bias
        nn.init.xavier_uniform_(self.fc1.weight)
        nn.init.zeros_(self.fc1.bias)
        nn.init.xavier_uniform_(self.fc2.weight)
        self.fc2.bias.data.copy_(torch.tensor([-0.2, 0.5, 0.2]))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h = self.relu(self.fc1(x))
        return self.fc2(h)


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
    ], dtype=np.float32)


class ReplayBuffer:
    def __init__(self, capacity: int = 20000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            torch.tensor(np.array(states), dtype=torch.float32),
            torch.tensor(actions, dtype=torch.int64).unsqueeze(1),
            torch.tensor(rewards, dtype=torch.float32).unsqueeze(1),
            torch.tensor(np.array(next_states), dtype=torch.float32),
            torch.tensor(dones, dtype=torch.float32).unsqueeze(1),
        )

    def __len__(self):
        return len(self.buffer)


def train_mlp_dqn(episodes: int = 40, gamma: float = 0.99, lr: float = 0.003, batch_size: int = 64) -> Dict[str, Any]:
    print(f"[*] Training Dino MLP Q-Network (7 -> 8 -> 3) across {episodes} episodes...")

    policy_net = DinoQNet()
    target_net = DinoQNet()
    target_net.load_state_dict(policy_net.state_dict())
    target_net.eval()

    optimizer = optim.Adam(policy_net.parameters(), lr=lr)
    loss_fn = nn.SmoothL1Loss()
    memory = ReplayBuffer(25000)

    epsilon = 0.90
    epsilon_min = 0.05
    epsilon_decay = 0.95

    # 1. Warm-up replay buffer with smart heuristic + random exploration
    print("[*] Pre-populating replay buffer with exploration transitions...")
    env = DinoEnv(start_speed=10.0, max_steps=2000)
    warmup_steps = 0
    while warmup_steps < 1000:
        obs, _ = env.reset(seed=random.randint(1, 9999))
        state = normalize_obs(obs)
        for _ in range(500):
            dist, _, _, elev, _, _, speed = obs
            if random.random() < 0.65:
                # Guided action
                action = 2 if (40 < elev < 85 and dist < speed * 15) else (1 if dist < (14.5 * speed - 12.0) else 0)
            else:
                action = random.randint(0, 2)

            next_obs, reward, terminated, _, _ = env.step(action)
            next_state = normalize_obs(next_obs)

            # Reward shaping
            shaped_reward = 0.1
            if terminated:
                shaped_reward = -100.0
            elif action == 1 and obs[4] == 0:
                shaped_reward -= 0.05

            memory.push(state, action, shaped_reward, next_state, terminated)
            warmup_steps += 1
            obs = next_obs
            state = next_state
            if terminated:
                break

    print(f"[*] Replay buffer ready ({len(memory)} samples). Starting Q-Learning...")

    # 2. Main Training Loop
    for ep in range(1, episodes + 1):
        env = DinoEnv(start_speed=random.uniform(8.0, 12.0), max_steps=1800)
        obs, _ = env.reset(seed=random.randint(1000, 99999))
        state = normalize_obs(obs)
        total_reward = 0
        steps = 0

        while steps < 1800:
            steps += 1
            # Epsilon-greedy action
            if random.random() < epsilon:
                action = random.randint(0, 2)
            else:
                with torch.no_grad():
                    st_tensor = torch.tensor(state, dtype=torch.float32).unsqueeze(0)
                    q_vals = policy_net(st_tensor)
                    action = q_vals.argmax(dim=1).item()

            next_obs, _, terminated, _, _ = env.step(action)
            next_state = normalize_obs(next_obs)

            shaped_reward = 0.1
            if terminated:
                shaped_reward = -100.0
            elif action == 1 and obs[4] == 0:
                shaped_reward -= 0.05

            memory.push(state, action, shaped_reward, next_state, terminated)
            state = next_state
            obs = next_obs
            total_reward += shaped_reward

            # Optimize network every 4 steps
            if len(memory) >= batch_size and steps % 4 == 0:
                b_states, b_actions, b_rewards, b_next_states, b_dones = memory.sample(batch_size)
                current_q = policy_net(b_states).gather(1, b_actions)
                with torch.no_grad():
                    max_next_q = target_net(b_next_states).max(1)[0].unsqueeze(1)
                    expected_q = b_rewards + (1.0 - b_dones) * gamma * max_next_q

                loss = loss_fn(current_q, expected_q)
                optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(policy_net.parameters(), 1.0)
                optimizer.step()

            if terminated:
                break

        epsilon = max(epsilon_min, epsilon * epsilon_decay)
        if ep % 5 == 0:
            target_net.load_state_dict(policy_net.state_dict())
            print(f"  [Ep {ep:02d}/{episodes}] Steps: {steps:4d} | Return: {total_reward:6.1f} | Eps: {epsilon:.3f}")

    # 3. Export weights to JSON matching TypeScript NetworkWeights format
    # TypeScript format: w1 is 7x8 (row=input, col=hidden), b1 is 8, w2 is 8x3, b2 is 3
    w1 = policy_net.fc1.weight.detach().cpu().numpy().T.tolist()  # (8, 7) -> (7, 8)
    b1 = policy_net.fc1.bias.detach().cpu().numpy().tolist()       # (8,)
    w2 = policy_net.fc2.weight.detach().cpu().numpy().T.tolist()  # (3, 8) -> (8, 3)
    b2 = policy_net.fc2.bias.detach().cpu().numpy().tolist()       # (3,)

    weights_json = {
        "modelType": "ANN",
        "w1": [[round(v, 4) for v in row] for row in w1],
        "b1": [round(v, 4) for v in b1],
        "w2": [[round(v, 4) for v in row] for row in w2],
        "b2": [round(v, 4) for v in b2],
    }

    with open("mlp_weights.json", "w") as f:
        json.dump(weights_json, f, indent=2)
    print("\n[*] Successfully exported trained weights to 'mlp_weights.json'!")

    # Quick 100-level benchmark
    print("[*] Benchmarking trained MLP on 100 seeded levels...")
    passed = 0
    for seed in range(1, 101):
        env = DinoEnv(start_speed=12.0, max_steps=1200)
        obs, _ = env.reset(seed=seed)
        crashed = False
        for _ in range(1200):
            st = normalize_obs(obs)
            with torch.no_grad():
                act = policy_net(torch.tensor(st, dtype=torch.float32).unsqueeze(0)).argmax(dim=1).item()
            obs, _, term, _, _ = env.step(act)
            if term:
                crashed = True
                break
        if not crashed:
            passed += 1

    print(f"[*] Benchmark Result: {passed}/100 levels passed ({passed}%).")
    return weights_json


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--episodes", type=int, default=30)
    args = parser.parse_args()

    train_mlp_dqn(episodes=args.episodes)
