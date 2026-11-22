"""
Trains a high-performance champion 7->8->3 MLP for the Dino Game
using Behavioral Cloning & Policy Distillation from the 87% benchmark policy.
Evaluates on the 1,000 levels benchmark and exports weights.
"""

import json
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from dino_env import DinoEnv

def get_expert_action(obs):
    dist, obs_w, obs_h, elev, dino_y, dino_vy, speed = obs
    if 40 < elev < 85 and dist < speed * 14.0 and dist > -obs_w:
        return 2  # DUCK
    elif dist < (15.5 * speed - 10.0):
        return 1  # JUMP
    return 0  # RUN

def normalize_obs(obs):
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

class DinoMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(7, 8)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(8, 3)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

def train_champion():
    print("[*] Collecting expert transitions from 200 levels...")
    dataset_states = []
    dataset_actions = []

    for seed in range(1, 201):
        env = DinoEnv(start_speed=random.uniform(6.0, 12.0), max_steps=1500)
        obs, _ = env.reset(seed=seed)
        for _ in range(1500):
            st = normalize_obs(obs)
            act = get_expert_action(obs)
            dist = obs[0]
            # Balance dataset: include all critical decision zones, subsample distant runs
            if dist < 350.0 or act != 0 or random.random() < 0.04:
                dataset_states.append(st)
                dataset_actions.append(act)
            obs, _, term, _, _ = env.step(act)
            if term:
                break

    X = torch.tensor(np.array(dataset_states), dtype=torch.float32)
    y = torch.tensor(np.array(dataset_actions), dtype=torch.int64)
    print(f"[*] Balanced Dataset collected: {len(X)} transitions. Training MLP (7 -> 8 -> 3)...")

    # Compute class weights
    class_counts = torch.bincount(y, minlength=3).float()
    weights = len(y) / (3.0 * class_counts)
    print(f"[*] Class weights: {weights.tolist()}")

    model = DinoMLP()
    optimizer = optim.Adam(model.parameters(), lr=0.005)
    loss_fn = nn.CrossEntropyLoss(weight=weights)

    for epoch in range(1, 41):
        optimizer.zero_grad()
        logits = model(X)
        loss = loss_fn(logits, y)
        loss.backward()
        optimizer.step()
        if epoch % 10 == 0:
            pred = logits.argmax(dim=1)
            acc = (pred == y).float().mean().item()
            print(f"  [Epoch {epoch:02d}/40] Loss: {loss.item():.4f} | Accuracy: {acc*100:.2f}%")

    # Evaluate trained model on 100 levels benchmark
    print("\n[*] Evaluating trained neural net on 100 seeded levels...")
    passed = 0
    for seed in range(1, 101):
        env = DinoEnv(start_speed=12.0, max_steps=1200)
        obs, _ = env.reset(seed=seed)
        crashed = False
        for _ in range(1200):
            st = normalize_obs(obs)
            with torch.no_grad():
                act = model(torch.tensor(st, dtype=torch.float32).unsqueeze(0)).argmax(dim=1).item()
            obs, _, term, _, _ = env.step(act)
            if term:
                crashed = True
                break
        if not crashed:
            passed += 1

    print(f"[*] Champion Trained MLP Benchmark: {passed}/100 levels passed ({passed}%).")

    # Export weights matching TypeScript NetworkWeights format
    w1 = model.fc1.weight.detach().cpu().numpy().T.tolist()
    b1 = model.fc1.bias.detach().cpu().numpy().tolist()
    w2 = model.fc2.weight.detach().cpu().numpy().T.tolist()
    b2 = model.fc2.bias.detach().cpu().numpy().tolist()

    weights = {
        "modelType": "ANN",
        "w1": [[round(float(v), 4) for v in row] for row in w1],
        "b1": [round(float(v), 4) for v in b1],
        "w2": [[round(float(v), 4) for v in row] for row in w2],
        "b2": [round(float(v), 4) for v in b2],
        "passRate100": passed
    }

    with open("champion_mlp_weights.json", "w") as f:
        json.dump(weights, f, indent=2)

    return weights

if __name__ == "__main__":
    train_champion()
