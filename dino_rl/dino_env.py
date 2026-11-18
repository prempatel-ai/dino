"""
Dino Gymnasium Environment (HF Deep RL Course Unit 0/1 Compatible)
Recreates the exact Chromium / 2D Canvas physics & obstacle logic in pure Python.
Supports standard RL algorithms (PPO, DQN) and Neuroevolution.
Zero mandatory dependencies: runs with or without gymnasium installed.
"""

import math
import random
from typing import Optional, Tuple, Dict, Any, List
import numpy as np

try:
    import gymnasium as gym
    from gymnasium import spaces
except ImportError:
    try:
        import gym
        from gym import spaces
    except ImportError:
        class DummySpaces:
            class Discrete:
                def __init__(self, n: int):
                    self.n = n
                def sample(self) -> int:
                    return random.randint(0, self.n - 1)

            class Box:
                def __init__(self, low: np.ndarray, high: np.ndarray, dtype=np.float32):
                    self.low = low
                    self.high = high
                    self.shape = low.shape
                    self.dtype = dtype
                def sample(self) -> np.ndarray:
                    return np.random.uniform(self.low, self.high).astype(self.dtype)

        spaces = DummySpaces
        class DummyEnv:
            def reset(self, *args, **kwargs):
                pass
            def step(self, action):
                pass
        gym = type("gym", (), {"Env": DummyEnv})


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


class DinoEnv(gym.Env):
    metadata = {"render_modes": ["human", "rgb_array"], "render_fps": 60}

    # Chromium Dino Physics Constants
    GRAVITY = 0.6
    INITIAL_JUMP_VELOCITY = -10.0
    DROP_VELOCITY = -5.0
    SPEED_START = 6.0
    SPEED_MAX = 13.0
    ACCELERATION = 0.001

    # Dimensions
    DINO_X = 50.0
    GROUND_Y = 93.0
    DINO_W = 44.0
    DINO_H = 47.0
    DINO_DUCK_W = 59.0
    DINO_DUCK_H = 25.0

    def __init__(self, ghost_mode: bool = False, max_steps: int = 10000):
        super().__init__()
        self.ghost_mode = ghost_mode
        self.max_steps = max_steps

        # 3 actions: 0=None, 1=Jump, 2=Duck
        self.action_space = spaces.Discrete(3)

        # 7 continuous observations
        self.observation_space = spaces.Box(
            low=np.array([0.0, 0.0, 0.0, 0.0, 0.0, -15.0, 0.0], dtype=np.float32),
            high=np.array([600.0, 150.0, 100.0, 150.0, 120.0, 15.0, 20.0], dtype=np.float32),
            dtype=np.float32,
        )

        self.rng = random.Random()
        self.reset()

    def reset(
        self,
        *,
        seed: Optional[int] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        if hasattr(super(), "reset"):
            try:
                super().reset(seed=seed)
            except Exception:
                pass

        if seed is not None:
            self.rng.seed(seed)

        self.speed = self.SPEED_START
        self.distance = 0.0
        self.steps = 0
        self.crashes = 0

        # Dino state (y_pos on canvas)
        self.dino_y = self.GROUND_Y
        self.dino_vy = 0.0
        self.is_jumping = False
        self.is_ducking = False

        # Obstacles list
        self.obstacles = []
        self.next_obstacle_dist = self.rng.uniform(300, 500)

        obs = self._get_obs()
        info = {"score": 0, "crashes": 0, "speed": self.speed}
        return obs, info

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        self.steps += 1
        self.distance += self.speed
        self.speed = min(self.SPEED_MAX, self.speed + self.ACCELERATION)

        # 1. Process Action (0=Run, 1=Jump, 2=Duck)
        if action == 1:
            if not self.is_jumping:
                self.is_jumping = True
                self.dino_vy = self.INITIAL_JUMP_VELOCITY
                self.is_ducking = False
        elif action == 2:
            self.is_ducking = True
            if self.is_jumping and self.dino_vy < 0:
                self.dino_vy += self.GRAVITY * 3.0
        else:
            self.is_ducking = False

        # 2. Update Dino Physics
        if self.is_jumping:
            self.dino_y += self.dino_vy
            self.dino_vy += self.GRAVITY
            if self.dino_y >= self.GROUND_Y:
                self.dino_y = self.GROUND_Y
                self.dino_vy = 0.0
                self.is_jumping = False

        # 3. Update & Spawn Obstacles
        for obs in self.obstacles:
            obs["x"] -= self.speed

        self.obstacles = [obs for obs in self.obstacles if obs["x"] + obs["w"] > 0]

        self.next_obstacle_dist -= self.speed
        if self.next_obstacle_dist <= 0:
            self._spawn_obstacle()

        # 4. Collision Detection
        collided = self._check_collision()

        # 5. Reward Calculation
        reward = 0.1

        for obs in self.obstacles:
            if not obs.get("passed", False) and obs["x"] + obs["w"] < self.DINO_X:
                obs["passed"] = True
                reward += 1.0

        terminated = False
        truncated = self.steps >= self.max_steps

        if collided:
            self.crashes += 1
            if self.ghost_mode:
                reward = -10.0
            else:
                reward = -100.0
                terminated = True

        info = {
            "score": int(self.distance / 10),
            "crashes": self.crashes,
            "speed": self.speed,
        }

        return self._get_obs(), reward, terminated, truncated, info

    def _spawn_obstacle(self):
        min_gap = round(self.DINO_W * self.speed * 0.6 + 120)
        self.next_obstacle_dist = self.rng.uniform(min_gap, min_gap + 200)

        if self.speed > 8.5 and self.rng.random() < 0.35:
            elevation = self.rng.choice([50.0, 75.0, 100.0])
            self.obstacles.append({
                "x": 600.0,
                "y": elevation,
                "w": 46.0,
                "h": 40.0,
                "type": "PTERODACTYL",
                "boxes": OBSTACLE_BOXES["PTERODACTYL"],
                "passed": False,
            })
        else:
            is_large = self.rng.random() < 0.4
            count = self.rng.choice([1, 2, 3]) if self.speed > 7.0 else self.rng.choice([1, 2])
            obs_type = "CACTUS_LARGE" if is_large else "CACTUS_SMALL"
            unit_w = 25.0 if is_large else 17.0
            h = 50.0 if is_large else 35.0
            y = 90.0 if is_large else 105.0

            boxes = []
            for c in range(count):
                offset_x = c * unit_w
                for b in OBSTACLE_BOXES[obs_type]:
                    boxes.append({
                        "x": b["x"] + offset_x,
                        "y": b["y"],
                        "w": b["w"],
                        "h": b["h"],
                    })

            self.obstacles.append({
                "x": 600.0,
                "y": y,
                "w": unit_w * count,
                "h": h,
                "type": obs_type,
                "boxes": boxes,
                "passed": False,
            })

    def _check_collision(self) -> bool:
        dino_w = self.DINO_DUCK_W if self.is_ducking else self.DINO_W
        dino_h = self.DINO_DUCK_H if self.is_ducking else self.DINO_H
        dino_y = (self.GROUND_Y + 22.0) if self.is_ducking else self.dino_y

        dino_outer = {
            "x": self.DINO_X + 1,
            "y": dino_y + 1,
            "w": dino_w - 2,
            "h": dino_h - 2,
        }

        trex_boxes = TREX_DUCK_COLLISION_BOXES if self.is_ducking else TREX_COLLISION_BOXES

        for obs in self.obstacles:
            obs_outer = {
                "x": obs["x"] + 1,
                "y": obs["y"] + 1,
                "w": obs["w"] - 2,
                "h": obs["h"] - 2,
            }

            # Phase 1: Outer bounding box test
            if not self._box_overlap(dino_outer, obs_outer):
                continue

            # Phase 2: Detailed sub-box test
            for tb in trex_boxes:
                tb_world = {
                    "x": self.DINO_X + tb["x"],
                    "y": dino_y + tb["y"],
                    "w": tb["w"],
                    "h": tb["h"],
                }
                for ob in obs["boxes"]:
                    ob_world = {
                        "x": obs["x"] + ob["x"],
                        "y": obs["y"] + ob["y"],
                        "w": ob["w"],
                        "h": ob["h"],
                    }
                    if self._box_overlap(tb_world, ob_world):
                        return True

        return False

    def _box_overlap(self, b1: Dict[str, float], b2: Dict[str, float]) -> bool:
        return (
            b1["x"] < b2["x"] + b2["w"]
            and b1["x"] + b1["w"] > b2["x"]
            and b1["y"] < b2["y"] + b2["h"]
            and b1["y"] + b1["h"] > b2["y"]
        )

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

        dino_height_above_ground = max(0.0, self.GROUND_Y - self.dino_y)

        if nearest is not None:
            return np.array([
                min_dist,
                nearest["w"],
                nearest["h"],
                nearest["y"],
                dino_height_above_ground,
                self.dino_vy,
                self.speed,
            ], dtype=np.float32)

        return np.array([
            600.0, 0.0, 0.0, 0.0, dino_height_above_ground, self.dino_vy, self.speed
        ], dtype=np.float32)
