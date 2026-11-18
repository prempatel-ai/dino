"""
Generator for dino_training_colab.ipynb
Generates a complete, self-contained Google Colab notebook for training:
1. 3-Byte Linear Model Optimizer
2. PyTorch Deep Q-Network (MLP 7->8->3)
3. Neuroevolution Genetic Algorithm
"""

import json

def build_notebook():
    cells = []

    # Title Markdown
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# 🦖 Dino Run — Autonomous AI Policy & Neural Network Training\n",
            "### Train 3-Byte Linear Heuristic, PyTorch MLP (DQN), and Neuroevolution (GA)\n",
            "\n",
            "This notebook trains all three AI policies for the Dino Run game and exports weights directly to `dino_trained_weights.json`. You can load this file directly into the in-game **Weights Manager** on the web app to watch your trained models play in real-time.\n",
            "\n",
            "**Table of Contents:**\n",
            "1. **Environment Setup & Pure Python Dino Simulator** (Chromium physics)\n",
            "2. **Part 1: 3-Byte Linear Heuristic Optimizer** (Finds optimal `a * speed + c`)\n",
            "3. **Part 2: PyTorch MLP Training with Deep Q-Learning (DQN)** (7 -> 8 -> 3)\n",
            "4. **Part 3: Neuroevolution Training (Genetic Algorithm)** (Population evolution)\n",
            "5. **Part 4: 1,000-Level Benchmark Evaluation** (Side-by-side comparison)\n",
            "6. **Export & Download Weights for Web Game**"
        ]
    })

    # Cell 1: Environment Code
    env_code = '''import math
import random
import json
from collections import deque
from typing import List, Dict, Any, Tuple
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

print(f"[*] Environment initialized. PyTorch version: {torch.__version__}, CUDA available: {torch.cuda.is_available()}")

# Chromium Dino Hitbox Definitions
TREX_COLLISION_BOXES = [
    {"x": 22, "y": 0, "w": 17, "h": 16},
    {"x": 1, "y": 18, "w": 30, "h": 9},
    {"x": 10, "y": 35, "w": 14, "h": 8},
    {"x": 1, "y": 24, "w": 29, "h": 5},
    {"x": 5, "y": 30, "w": 21, "h": 4},
    {"x": 9, "y": 34, "w": 15, "h": 4},
]

TREX_DUCK_COLLISION_BOXES = [
    {"x": 1, "y": 18, "w": 55, "h": 25},
]

OBSTACLE_BOXES = {
    "CACTUS_SMALL": [
        {"x": 0, "y": 7, "w": 5, "h": 27},
        {"x": 4, "y": 0, "w": 6, "h": 34},
        {"x": 10, "y": 4, "w": 7, "h": 14},
    ],
    "CACTUS_LARGE": [
        {"x": 0, "y": 12, "w": 7, "h": 38},
        {"x": 8, "y": 0, "w": 7, "h": 49},
        {"x": 13, "y": 10, "w": 10, "h": 38},
    ],
    "PTERODACTYL": [
        {"x": 15, "y": 15, "w": 16, "h": 5},
        {"x": 18, "y": 21, "w": 24, "h": 6},
        {"x": 2, "y": 14, "w": 4, "h": 3},
        {"x": 6, "y": 10, "w": 4, "h": 7},
        {"x": 10, "y": 8, "w": 6, "h": 9},
    ],
}

class DinoEnv:
    GRAVITY = 0.6
    INITIAL_JUMP_VELOCITY = -10.0
    DROP_VELOCITY = -5.0
    SPEED_START = 6.0
    SPEED_MAX = 13.0
    ACCELERATION = 0.001

    DINO_X = 50.0
    GROUND_Y = 93.0
    DINO_W = 44.0
    DINO_H = 47.0
    DINO_DUCK_W = 59.0
    DINO_DUCK_H = 25.0

    def __init__(self, max_steps: int = 1500, start_speed: float = 6.0):
        self.max_steps = max_steps
        self.start_speed = start_speed
        self.reset()

    def reset(self, seed: int = None):
        if seed is not None:
            self.rng = random.Random(seed)
        else:
            self.rng = random.Random()

        self.speed = self.start_speed
        self.dino_y = self.GROUND_Y
        self.dino_vy = 0.0
        self.is_jumping = False
        self.is_ducking = False
        self.step_count = 0
        self.score = 0
        self.obstacles = []
        self.next_obstacle_dist = 300.0

        return self._get_obs(), {}

    def step(self, action: int):
        self.step_count += 1
        self.score += 1
        self.speed = min(self.SPEED_MAX, self.speed + self.ACCELERATION)

        # Action handling: 0=RUN, 1=JUMP, 2=DUCK
        if action == 1:  # JUMP
            if not self.is_jumping:
                self.is_jumping = True
                self.dino_vy = self.INITIAL_JUMP_VELOCITY
                self.is_ducking = False
        elif action == 2:  # DUCK
            self.is_ducking = True
            if self.is_jumping and self.dino_vy < self.DROP_VELOCITY:
                self.dino_vy = self.DROP_VELOCITY
        else:
            self.is_ducking = False

        if self.is_jumping:
            self.dino_y += self.dino_vy
            self.dino_vy += self.GRAVITY
            if self.dino_y >= self.GROUND_Y:
                self.dino_y = self.GROUND_Y
                self.dino_vy = 0.0
                self.is_jumping = False

        # Move obstacles
        for obs in self.obstacles:
            obs["x"] -= self.speed

        self.obstacles = [o for o in self.obstacles if o["x"] + o["w"] > 0]

        # Spawn obstacles
        self.next_obstacle_dist -= self.speed
        if self.next_obstacle_dist <= 0:
            self._spawn_obstacle()

        collision = self._check_collision()
        terminated = collision or (self.step_count >= self.max_steps)

        reward = 0.1
        if collision:
            reward = -100.0
        elif action == 1 and self.dino_y == self.GROUND_Y:
            reward -= 0.05

        return self._get_obs(), reward, terminated, False, {}

    def _spawn_obstacle(self):
        can_ptero = self.speed > 8.5 and self.score > 250
        spawn_ptero = can_ptero and self.rng.random() < 0.28

        if spawn_ptero:
            elevation = self.rng.choice([100.0, 75.0, 50.0])
            w, h = 46.0, 40.0
            min_gap = round(w * self.speed + 150 * 0.6)
            self.next_obstacle_dist = self.rng.uniform(min_gap, min_gap * 1.5)
            self.obstacles.append({
                "x": 600.0, "y": elevation, "w": w, "h": h,
                "type": "PTERODACTYL", "boxes": OBSTACLE_BOXES["PTERODACTYL"], "passed": False,
            })
        else:
            is_large = self.rng.random() < 0.4
            count = self.rng.choice([1, 2, 3]) if self.speed > 7.0 else self.rng.choice([1, 2])
            obs_type = "CACTUS_LARGE" if is_large else "CACTUS_SMALL"
            unit_w = 25.0 if is_large else 17.0
            h = 50.0 if is_large else 35.0
            y = 90.0 if is_large else 105.0
            w = unit_w * count

            min_gap = round(w * self.speed + 120 * 0.6)
            self.next_obstacle_dist = self.rng.uniform(min_gap, min_gap * 1.5)

            boxes = []
            for c in range(count):
                offset_x = c * unit_w
                for b in OBSTACLE_BOXES[obs_type]:
                    boxes.append({"x": b["x"] + offset_x, "y": b["y"], "w": b["w"], "h": b["h"]})

            self.obstacles.append({
                "x": 600.0, "y": y, "w": w, "h": h,
                "type": obs_type, "boxes": boxes, "passed": False,
            })

    def _check_collision(self) -> bool:
        dino_w = self.DINO_DUCK_W if self.is_ducking else self.DINO_W
        dino_h = self.DINO_DUCK_H if self.is_ducking else self.DINO_H
        dino_y = (self.GROUND_Y + 22.0) if self.is_ducking else self.dino_y

        dino_outer = {"x": self.DINO_X + 1, "y": dino_y + 1, "w": dino_w - 2, "h": dino_h - 2}

        trex_boxes = TREX_DUCK_COLLISION_BOXES if self.is_ducking else TREX_COLLISION_BOXES

        for obs in self.obstacles:
            obs_outer = {"x": obs["x"] + 1, "y": obs["y"] + 1, "w": obs["w"] - 2, "h": obs["h"] - 2}
            if not self._box_overlap(dino_outer, obs_outer):
                continue
            for tb in trex_boxes:
                tb_world = {"x": self.DINO_X + tb["x"], "y": dino_y + tb["y"], "w": tb["w"], "h": tb["h"]}
                for ob in obs["boxes"]:
                    ob_world = {"x": obs["x"] + ob["x"], "y": obs["y"] + ob["y"], "w": ob["w"], "h": ob["h"]}
                    if self._box_overlap(tb_world, ob_world):
                        return True
        return False

    def _box_overlap(self, b1, b2) -> bool:
        return (b1["x"] < b2["x"] + b2["w"] and b1["x"] + b1["w"] > b2["x"] and
                b1["y"] < b2["y"] + b2["h"] and b1["y"] + b1["h"] > b2["y"])

    def _get_obs(self) -> np.ndarray:
        dino_front = self.DINO_X + self.DINO_W
        nearest = None
        min_dist = 600.0

        for obs in self.obstacles:
            if obs["x"] + obs["w"] > self.DINO_X:
                dist = max(0.0, obs["x"] - dino_front)
                if dist < min_dist:
                    min_dist = dist
                    nearest = obs

        dino_height = max(0.0, self.GROUND_Y - self.dino_y)

        if nearest is not None:
            return np.array([min_dist, nearest["w"], nearest["h"], nearest["y"], dino_height, self.dino_vy, self.speed], dtype=np.float32)
        return np.array([600.0, 0.0, 0.0, 0.0, dino_height, self.dino_vy, self.speed], dtype=np.float32)

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
'''

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [env_code]
    })

    # Section 1 Markdown & Code: 3-Byte Linear Optimizer
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## Part 1: Train & Optimize 3-Byte Linear Model\n",
            "The 3-byte model compresses the entire game-playing logic into 3 parameters:\n",
            "`threshold = a * speed + c`\n",
            "`duck_threshold = duck_dist * speed` (when pterodactyl altitude >= 65)\n",
            "\n",
            "Let's optimize `(a, c, duck_dist)` across 100 benchmark levels to maximize clearance."
        ]
    })

    linear_code = '''def eval_linear_candidate(a: float, c: float, duck_dist: float, num_levels: int = 100) -> float:
    passed = 0
    for seed in range(1, num_levels + 1):
        env = DinoEnv(start_speed=12.0, max_steps=1200)
        obs, _ = env.reset(seed=seed)
        crashed = False

        for _ in range(1200):
            dist, obs_w, obs_h, obs_elev, dino_y, dino_vy, speed = obs
            action = 0
            if 40 < obs_elev < 85 and dist < speed * duck_dist and dist > -obs_w:
                action = 2  # DUCK
            elif dist < a * speed + c:
                action = 1  # JUMP

            obs, _, term, _, _ = env.step(action)
            if term:
                crashed = True
                break
        if not crashed:
            passed += 1
    return passed / num_levels

# Fine grid search around Chromium physical jump trajectory
print("[*] Optimizing 3-Byte Linear parameters...")
best_a, best_c, best_duck = 14.5, -12.9, 16.0
best_pass = eval_linear_candidate(best_a, best_c, best_duck, 100)
print(f"[*] Baseline (14.5*S - 12.9): {best_pass*100:.1f}% pass rate on 100 levels")

for a in [14.0, 14.2, 14.5, 14.8, 15.0]:
    for c in [-16.0, -14.0, -12.9, -11.0, -9.0]:
        for duck in [14.0, 16.0, 18.0]:
            rate = eval_linear_candidate(a, c, duck, 100)
            if rate > best_pass:
                best_pass = rate
                best_a, best_c, best_duck = a, c, duck
                print(f"  [+] New Best: a={best_a:.2f}, c={best_c:.2f}, duck={best_duck:.1f} -> {best_pass*100:.1f}%")

trained_linear_weights = {
    "modelType": "LINEAR",
    "a": round(best_a, 2),
    "c": round(best_c, 2),
    "duckElev": 75,
    "duckDist": round(best_duck, 1)
}

with open("linear_weights.json", "w") as f:
    json.dump(trained_linear_weights, f, indent=2)

print(f"\\n[*] Optimal 3-Byte Linear Model: {best_a} * speed + ({best_c}) | Pass: {best_pass*100:.1f}%")
print("[*] Saved to 'linear_weights.json'")
'''

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [linear_code]
    })

    # Section 2 Markdown & Code: PyTorch MLP DQN
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## Part 2: Train MLP Neural Network (7 -> 8 -> 3) with PyTorch DQN\n",
            "This trains an exact **7-input, 8-hidden neuron (ReLU), 3-output** Multilayer Perceptron.\n",
            "Weights `w1`, `b1`, `w2`, `b2` match the in-game canvas visualizer in the web app."
        ]
    })

    dqn_code = '''class DinoMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(7, 8)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(8, 3)

        # Pre-seed with stable jump bias
        nn.init.xavier_uniform_(self.fc1.weight)
        nn.init.zeros_(self.fc1.bias)
        nn.init.xavier_uniform_(self.fc2.weight)
        self.fc2.bias.data.copy_(torch.tensor([-0.2, 0.5, 0.2]))

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))

class ReplayMemory:
    def __init__(self, capacity=20000):
        self.buffer = deque(maxlen=capacity)
    def push(self, s, a, r, s_next, done):
        self.buffer.append((s, a, r, s_next, done))
    def sample(self, batch_size):
        b = random.sample(self.buffer, batch_size)
        s, a, r, sn, d = zip(*b)
        return (torch.tensor(np.array(s), dtype=torch.float32),
                torch.tensor(a, dtype=torch.int64).unsqueeze(1),
                torch.tensor(r, dtype=torch.float32).unsqueeze(1),
                torch.tensor(np.array(sn), dtype=torch.float32),
                torch.tensor(d, dtype=torch.float32).unsqueeze(1))
    def __len__(self):
        return len(self.buffer)

def train_dqn(episodes=30):
    policy_net = DinoMLP()
    target_net = DinoMLP()
    target_net.load_state_dict(policy_net.state_dict())
    optimizer = optim.Adam(policy_net.parameters(), lr=0.003)
    loss_fn = nn.SmoothL1Loss()
    memory = ReplayMemory(20000)

    # 1. Warm-up
    print("[*] Pre-populating replay buffer with exploration transitions...")
    env = DinoEnv(start_speed=10.0, max_steps=1500)
    warmup = 0
    while warmup < 1000:
        obs, _ = env.reset(seed=random.randint(1, 9999))
        st = normalize_obs(obs)
        for _ in range(300):
            dist, _, _, elev, _, _, speed = obs
            act = 2 if (40 < elev < 85 and dist < speed * 15) else (1 if (dist < 14.5 * speed - 12.0) else 0) if random.random() < 0.65 else random.randint(0, 2)
            n_obs, _, term, _, _ = env.step(act)
            n_st = normalize_obs(n_obs)
            rew = -100.0 if term else 0.1
            memory.push(st, act, rew, n_st, term)
            warmup += 1
            st, obs = n_st, n_obs
            if term: break

    # 2. Train
    print(f"[*] Training PyTorch DQN across {episodes} episodes...")
    eps = 0.90
    for ep in range(1, episodes + 1):
        obs, _ = env.reset(seed=random.randint(1000, 99999))
        st = normalize_obs(obs)
        tot_r, steps = 0, 0
        while steps < 1500:
            steps += 1
            if random.random() < eps:
                act = random.randint(0, 2)
            else:
                with torch.no_grad():
                    act = policy_net(torch.tensor(st, dtype=torch.float32).unsqueeze(0)).argmax(dim=1).item()

            n_obs, _, term, _, _ = env.step(act)
            n_st = normalize_obs(n_obs)
            rew = -100.0 if term else 0.1
            memory.push(st, act, rew, n_st, term)
            st, obs = n_st, n_obs
            tot_r += rew

            if len(memory) >= 64 and steps % 4 == 0:
                bs, ba, br, bsn, bd = memory.sample(64)
                cur_q = policy_net(bs).gather(1, ba)
                with torch.no_grad():
                    max_q = target_net(bsn).max(1)[0].unsqueeze(1)
                    exp_q = br + (1.0 - bd) * 0.99 * max_q
                loss = loss_fn(cur_q, exp_q)
                optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(policy_net.parameters(), 1.0)
                optimizer.step()

            if term: break

        eps = max(0.05, eps * 0.94)
        if ep % 5 == 0:
            target_net.load_state_dict(policy_net.state_dict())
            print(f"  [Ep {ep:02d}/{episodes}] Steps: {steps:4d} | Reward: {tot_r:6.1f} | Epsilon: {eps:.3f}")

    # Convert to TypeScript NetworkWeights format: w1 is 7x8, b1 is 8, w2 is 8x3, b2 is 3
    w1 = policy_net.fc1.weight.detach().cpu().numpy().T.tolist()
    b1 = policy_net.fc1.bias.detach().cpu().numpy().tolist()
    w2 = policy_net.fc2.weight.detach().cpu().numpy().T.tolist()
    b2 = policy_net.fc2.bias.detach().cpu().numpy().tolist()

    weights = {
        "modelType": "ANN",
        "w1": [[round(v, 4) for v in row] for row in w1],
        "b1": [round(v, 4) for v in b1],
        "w2": [[round(v, 4) for v in row] for row in w2],
        "b2": [round(v, 4) for v in b2]
    }
    with open("mlp_weights.json", "w") as f:
        json.dump(weights, f, indent=2)
    print("[*] Exported 'mlp_weights.json'")
    return weights

trained_mlp_weights = train_dqn(episodes=30)
'''

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [dqn_code]
    })

    # Section 3 Markdown & Code: Neuroevolution
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## Part 3: Train Neuroevolution (Genetic Algorithm)\n",
            "Evolves a population of 30 neural networks using mutation and natural selection."
        ]
    })

    ga_code = '''class GAGenome:
    def __init__(self):
        self.w1 = np.random.randn(7, 8) * 0.4
        self.b1 = np.zeros(8)
        self.w2 = np.random.randn(8, 3) * 0.4
        self.b2 = np.array([-0.2, 0.5, 0.2])
        self.fitness = 0.0

    def predict(self, x):
        h = np.maximum(0, np.dot(x, self.w1) + self.b1)
        return int(np.argmax(np.dot(h, self.w2) + self.b2))

    def clone(self):
        c = GAGenome()
        c.w1, c.b1 = np.copy(self.w1), np.copy(self.b1)
        c.w2, c.b2 = np.copy(self.w2), np.copy(self.b2)
        return c

    def mutate(self, rate=0.20, sigma=0.30):
        for arr in [self.w1, self.b1, self.w2, self.b2]:
            mask = np.random.rand(*arr.shape) < rate
            arr[mask] += np.random.randn(*arr.shape)[mask] * sigma

def train_ga(pop_size=30, generations=12):
    print(f"[*] Evolving Neuroevolution Population ({pop_size} agents across {generations} gens)...")
    pop = [GAGenome() for _ in range(pop_size)]

    # Seed top agent with heuristic prior
    pop[0].w1[0] = [-2.8, -3.2, 1.5, -4.0, 0.0, 0.0, -1.5, 2.0]
    pop[0].w1[6] = [1.8, 2.2, 0.0, 2.5, 0.0, 0.0, 1.2, 0.0]
    pop[0].w2[:, 1] = [2.5, 2.2, -1.0, 2.0, -1.0, -0.5, 1.2, -0.5]

    best = pop[0]

    for g in range(1, generations + 1):
        seeds = [random.randint(1, 9999) for _ in range(4)]
        for ind in pop:
            fit = 0
            for s in seeds:
                env = DinoEnv(start_speed=11.5, max_steps=1200)
                obs, _ = env.reset(seed=s)
                steps = 0
                while steps < 1200:
                    act = ind.predict(normalize_obs(obs))
                    obs, _, term, _, _ = env.step(act)
                    steps += 1
                    if term: break
                fit += steps
            ind.fitness = fit / len(seeds)

        pop.sort(key=lambda x: x.fitness, reverse=True)
        if pop[0].fitness > best.fitness:
            best = pop[0].clone()
            best.fitness = pop[0].fitness

        print(f"  [Gen {g:02d}/{generations}] Best Fitness: {pop[0].fitness:.1f} steps")

        new_pop = [pop[0].clone(), pop[1].clone()]
        while len(new_pop) < pop_size:
            p = max(random.sample(pop[:12], 3), key=lambda x: x.fitness).clone()
            p.mutate()
            new_pop.append(p)
        pop = new_pop

    weights = {
        "type": "neuroevo",
        "modelType": "EVOLUTION",
        "w1": [[round(float(v), 4) for v in row] for row in best.w1],
        "b1": [round(float(v), 4) for v in best.b1],
        "w2": [[round(float(v), 4) for v in row] for row in best.w2],
        "b2": [round(float(v), 4) for v in best.b2],
        "fitness": round(best.fitness, 1)
    }
    with open("neuroevo_weights.json", "w") as f:
        json.dump(weights, f, indent=2)
    print("[*] Exported 'neuroevo_weights.json'")
    return weights

trained_ga_weights = train_ga()
'''

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [ga_code]
    })

    # Section 4 Markdown & Code: 1,000-Level Benchmark & Bundle Export
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## Part 4: Run the 1,000-Level Benchmark Test Suite\n",
            "Evaluate all three trained policies across the exact reproducible 1,000 seeded levels."
        ]
    })

    bench_code = '''def run_benchmark_1000(policy_type="linear", weights=None, num_levels=1000):
    print(f"[*] Running 1,000-Level Benchmark on '{policy_type.upper()}' policy...")
    passed = 0
    scores = []

    for seed in range(1, num_levels + 1):
        env = DinoEnv(start_speed=12.0, max_steps=1500)
        obs, _ = env.reset(seed=seed)
        crashed = False

        for _ in range(1500):
            if policy_type == "linear":
                a = weights.get("a", 14.5)
                c = weights.get("c", -12.9)
                duck_dist = weights.get("duckDist", 16.0)
                dist, obs_w, obs_h, elev, _, _, speed = obs
                act = 2 if (40 < elev < 85 and dist < speed * duck_dist and dist > -obs_w) else (1 if dist < a * speed + c else 0)
            elif policy_type == "mlp":
                w1 = np.array(weights["w1"])
                b1 = np.array(weights["b1"])
                w2 = np.array(weights["w2"])
                b2 = np.array(weights["b2"])
                h = np.maximum(0, np.dot(normalize_obs(obs), w1) + b1)
                act = int(np.argmax(np.dot(h, w2) + b2))
            elif policy_type == "ga":
                w1 = np.array(weights["w1"])
                b1 = np.array(weights["b1"])
                w2 = np.array(weights["w2"])
                b2 = np.array(weights["b2"])
                h = np.maximum(0, np.dot(normalize_obs(obs), w1) + b1)
                act = int(np.argmax(np.dot(h, w2) + b2))

            obs, _, term, _, _ = env.step(act)
            if term:
                crashed = True
                break

        scores.append(env.score)
        if not crashed:
            passed += 1

    rate = (passed / num_levels) * 100
    avg_score = sum(scores) / len(scores)
    print(f"  [RESULT] Passed {passed}/{num_levels} levels ({rate:.2f}%) | Avg Score: {avg_score:.1f} pts")
    return rate, avg_score

lin_rate, _ = run_benchmark_1000("linear", trained_linear_weights, 1000)
mlp_rate, _ = run_benchmark_1000("mlp", trained_mlp_weights, 1000)
ga_rate, _ = run_benchmark_1000("ga", trained_ga_weights, 1000)
'''

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [bench_code]
    })

    # Section 5: Download Weights Bundle
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## Part 5: Export & Download Master Weights Bundle\n",
            "This cell creates `dino_trained_weights.json` containing the weights for all three models and triggers a download in Google Colab.\n",
            "You can then open `http://localhost:3000` (or GitHub Pages), open **AI Autopilot**, click **Weights Manager**, and upload or paste this file to play!"
        ]
    })

    export_code = '''import json
from datetime import datetime

master_bundle = {
    "version": "1.0",
    "description": "Trained Dino AI Models (Google Colab)",
    "exportedAt": datetime.now().isoformat(),
    "linear": trained_linear_weights,
    "mlp": trained_mlp_weights,
    "neuroevo": trained_ga_weights
}

filename = "dino_trained_weights.json"
with open(filename, "w") as f:
    json.dump(master_bundle, f, indent=2)

print(f"[*] Successfully created '{filename}'!")

# Try Google Colab file download
try:
    from google.colab import files
    files.download(filename)
    print("[*] Downloading JSON file to your computer...")
except ImportError:
    print("[*] Running locally (not Colab). File saved in current working directory.")

# Print JSON string snippet for direct copy-pasting
print("\\n" + "="*50)
print("PASTEABLE JSON FOR THE IN-GAME WEIGHTS MANAGER:")
print("="*50)
print(json.dumps(master_bundle, indent=2)[:500] + "...\\n[truncated - see full file]")
'''

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [export_code]
    })

    notebook = {
        "nbformat": 4,
        "nbformat_minor": 2,
        "metadata": {
            "colab": {
                "name": "Dino_Game_RL_Training.ipynb",
                "provenance": []
            },
            "kernelspec": {
                "display_name": "Python 3",
                "name": "python3"
            },
            "language_info": {
                "name": "python"
            }
        },
        "cells": cells
    }

    with open("dino_training_colab.ipynb", "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=2)

    print("[*] Successfully built 'dino_training_colab.ipynb'!")

if __name__ == "__main__":
    build_notebook()
