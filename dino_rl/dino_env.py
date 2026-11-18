"""
Dino Gymnasium Environment (HF Deep RL Course Unit 0/1 Compatible)
Recreates the exact Chromium / 2D Canvas physics & obstacle logic in pure Python.
Supports standard RL algorithms (PPO, DQN) and Neuroevolution.
"""

import math
import random
from typing import Optional, Tuple, Dict, Any
import numpy as np

try:
    import gymnasium as gym
    from gymnasium import spaces
except ImportError:
    # Graceful fallback if gymnasium isn't installed in active environment
    import gym
    from gym import spaces


class DinoEnv(gym.Env):
    """
    Chromium Dino 2D Gymnasium Environment.

    Action Space:
        Discrete(3):
            0: Do nothing (Run)
            1: Jump
            2: Duck

    Observation Space:
        Box(7):
            0: distance_to_obstacle (px, 0 to 600)
            1: obstacle_width (px)
            2: obstacle_height (px)
            3: obstacle_elevation (px, y-position)
            4: dino_y (px above ground, 0 to 100)
            5: dino_velocity_y (px/frame, -10 to +10)
            6: game_speed (px/frame, 6.0 to 13.0)
    """

    metadata = {"render_modes": ["human", "rgb_array"], "render_fps": 60}

    # Chromium Dino Physics Constants
    GRAVITY = 0.6
    INITIAL_JUMP_VELOCITY = -10.0
    DROP_VELOCITY = -5.0
    SPEED_START = 6.0
    SPEED_MAX = 13.0
    ACCELERATION = 0.001
    GROUND_Y = 100.0

    # Dimensions
    DINO_X = 50.0
    DINO_W = 44.0
    DINO_H = 47.0
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
        super().reset(seed=seed)
        if seed is not None:
            self.rng.seed(seed)

        self.speed = self.SPEED_START
        self.distance = 0.0
        self.steps = 0
        self.crashes = 0

        # Dino state
        self.dino_y = 0.0  # height above ground
        self.dino_vy = 0.0
        self.is_jumping = False
        self.is_ducking = False

        # Obstacles list: each is dict(x, y, w, h, type, passed)
        self.obstacles = []
        self.next_obstacle_dist = self.rng.uniform(300, 500)

        obs = self._get_obs()
        info = {"score": 0, "crashes": 0, "speed": self.speed}
        return obs, info

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        self.steps += 1
        self.distance += self.speed
        self.speed = min(self.SPEED_MAX, self.speed + self.ACCELERATION)

        # 1. Process Action
        # 0 = Run, 1 = Jump, 2 = Duck
        if action == 1:  # Jump
            if not self.is_jumping:
                self.is_jumping = True
                self.dino_vy = self.INITIAL_JUMP_VELOCITY
                self.is_ducking = False
        elif action == 2:  # Duck
            self.is_ducking = True
            if self.is_jumping and self.dino_vy < 0:
                # Fast drop
                self.dino_vy += self.GRAVITY * 2.0
        else:  # Run
            self.is_ducking = False

        # 2. Update Dino Physics
        if self.is_jumping:
            self.dino_y -= self.dino_vy
            self.dino_vy += self.GRAVITY
            if self.dino_y <= 0:
                self.dino_y = 0.0
                self.dino_vy = 0.0
                self.is_jumping = False

        # 3. Update & Spawn Obstacles
        for obs in self.obstacles:
            obs["x"] -= self.speed

        # Remove off-screen obstacles
        self.obstacles = [obs for obs in self.obstacles if obs["x"] + obs["w"] > 0]

        # Spawn new obstacle
        self.next_obstacle_dist -= self.speed
        if self.next_obstacle_dist <= 0:
            self._spawn_obstacle()

        # 4. Collision Detection
        collided = self._check_collision()

        # 5. Reward Calculation
        # Base survival reward: +0.1 per frame
        reward = 0.1

        # Bonus for clearing an obstacle ahead
        dino_front = self.DINO_X + self.DINO_W
        for obs in self.obstacles:
            if not obs.get("passed", False) and obs["x"] + obs["w"] < self.DINO_X:
                obs["passed"] = True
                reward += 1.0  # obstacle clear bonus

        terminated = False
        truncated = self.steps >= self.max_steps

        if collided:
            self.crashes += 1
            if self.ghost_mode:
                # Ghost Mode trick: non-fatal, penalty applied, continues learning
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
        # Gap between obstacles scales with speed
        min_gap = round(self.DINO_W * self.speed + 120)
        self.next_obstacle_dist = self.rng.uniform(min_gap, min_gap + 250)

        # At higher speed (> 8.5), allow pterodactyls (birds)
        if self.speed > 8.5 and self.rng.random() < 0.35:
            # Pterodactyl at high (50), mid (75), or low (100)
            elevation = self.rng.choice([50.0, 75.0, 100.0])
            self.obstacles.append({
                "x": 600.0,
                "y": elevation,
                "w": 46.0,
                "h": 40.0,
                "type": "PTERO",
                "passed": False,
            })
        else:
            # Cactus (small or large group)
            is_large = self.rng.random() < 0.4
            count = self.rng.choice([1, 2, 3])
            w = (25.0 if not is_large else 35.0) * count
            h = 35.0 if not is_large else 50.0
            self.obstacles.append({
                "x": 600.0,
                "y": self.GROUND_Y - h,
                "w": w,
                "h": h,
                "type": "CACTUS",
                "passed": False,
            })

    def _check_collision(self) -> bool:
        dino_h = self.DINO_DUCK_H if self.is_ducking else self.DINO_H
        dino_top = self.GROUND_Y - self.dino_y - dino_h
        dino_bottom = self.GROUND_Y - self.dino_y
        dino_left = self.DINO_X
        dino_right = self.DINO_X + self.DINO_W

        for obs in self.obstacles:
            obs_left = obs["x"]
            obs_right = obs["x"] + obs["w"]
            obs_top = obs["y"]
            obs_bottom = obs["y"] + obs["h"]

            # AABB overlap with 4px inner tolerance margin (matching Chromium hitboxes)
            margin = 4.0
            if (
                dino_right - margin > obs_left + margin
                and dino_left + margin < obs_right - margin
                and dino_bottom - margin > obs_top + margin
                and dino_top + margin < obs_bottom - margin
            ):
                return True
        return False

    def _get_obs(self) -> np.ndarray:
        # Find nearest obstacle ahead of Dino
        dino_front = self.DINO_X + self.DINO_W
        nearest = None
        min_dist = 600.0

        for obs in self.obstacles:
            if obs["x"] + obs["w"] > self.DINO_X:
                dist = max(0.0, obs["x"] - dino_front)
                if dist < min_dist:
                    min_dist = dist
                    nearest = obs

        if nearest is not None:
            return np.array([
                min_dist,
                nearest["w"],
                nearest["h"],
                nearest["y"],
                self.dino_y,
                self.dino_vy,
                self.speed,
            ], dtype=np.float32)

        return np.array([
            600.0, 0.0, 0.0, 0.0, self.dino_y, self.dino_vy, self.speed
        ], dtype=np.float32)
