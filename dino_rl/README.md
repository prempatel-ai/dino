# Dino 2D — Reinforcement Learning & Neuroevolution

Implementation of the Chrome Dino AI experiment based on the viral breakdown by [@thesidcodes](https://www.instagram.com/thesidcodes/): **"How small can an AI for the Chrome Dino Game get?"**

This repository provides both an **interactive in-browser AI playground** and a **Gymnasium standard environment** compatible with the [Hugging Face Deep RL Course](https://huggingface.co/learn/deep-rl-course/unit0/introduction).

---

## 1. The Core Takeaways from the Reel

1. **The Naive Rule (`11 * speed`)**:
   - Only achieves **~71% clear rate**. It fails when obstacles are wide, double/triple cacti spawn, or game speed ramps up.
2. **The 7-Input Neural Network**:
   - Inputs: `[distance, obstacle_width, obstacle_height, obstacle_elevation, dino_y, dino_vy, game_speed]`.
   - Output: `[Run, Jump, Duck]`.
   - Trained via **Neuroevolution** with the **Ghost Collision Trick** (crashes are non-fatal at first so bad networks keep accumulating training signal).
   - Reaches **100/100 levels cleared**.
3. **The 3-Byte Linear Model**:
   - Through weight pruning, the neural net reduces to a single linear equation:
     $$\text{Jump if: } \text{distance} < 14.5 \times \text{speed} - 12.9$$
   - Storage size: 3 numbers $\times$ 6 bits = **18 bits (just 3 Bytes)**!
   - Clears **30,000 brand new unseen levels with 0 crashes**.

---

## 2. In-Browser Live AI Playground

In the live web game, you can cycle the **`🤖 AI` button** (or press key **`A`**) in the top menu bar:

- `🎮 Manual`: Play yourself using `Space` / `Down Arrow`.
- `📏 11*S (71%)`: The naive heuristic (watch where it crashes on high speed).
- `⚡ 3-BYTE (100%)`: The pruned 3-number linear model with dynamic raycast distance HUD.
- `🧠 NEURAL NET`: 7-input neural network with live confidence scoring.
- `🧬 EVOLVE (GHOST)`: Real-time genetic algorithm running directly on your screen with ghost collisions and live generation tracking!

---

## 3. Python Gymnasium Environment (`dino_rl/`)

### Installation
```bash
pip install gymnasium numpy
# Optional for PPO (HF Course Unit 1):
pip install stable-baselines3
```

### Quick Benchmark Test
Run the comparison between the Naive Rule and the 3-Byte Linear Policy across 100 levels:
```bash
python dino_rl/train_evolution.py
```

### Train using PPO (Hugging Face RL Course style)
```bash
python dino_rl/train_ppo.py --timesteps 50000
```

### Using in your own RL scripts:
```python
from dino_rl.dino_env import DinoEnv

# ghost_mode=True makes crashes non-fatal with penalty (ideal for neuroevolution)
env = DinoEnv(ghost_mode=False)
obs, info = env.reset(seed=42)

for _ in range(1000):
    action = env.action_space.sample()  # or your policy: 0=Run, 1=Jump, 2=Duck
    obs, reward, terminated, truncated, info = env.step(action)
    if terminated or truncated:
        obs, info = env.reset()
```
