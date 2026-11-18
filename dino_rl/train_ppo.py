"""
Hugging Face Deep RL Course (Unit 1 Style) - PPO Training on DinoEnv
Uses Stable-Baselines3 PPO to train an RL Agent on the Dino 2D Environment.
"""

import os
import argparse
from dino_env import DinoEnv

try:
    from stable_baselines3 import PPO
    from stable_baselines3.common.evaluation import evaluate_policy
    from stable_baselines3.common.env_checker import check_env
    from stable_baselines3.common.monitor import Monitor
    SB3_AVAILABLE = True
except ImportError:
    SB3_AVAILABLE = False


def train_ppo(total_timesteps: int = 50_000, save_path: str = "ppo_dino.zip"):
    if not SB3_AVAILABLE:
        print("[!] Stable-Baselines3 is not installed in this environment.")
        print("    Install via: pip install stable-baselines3 gymnasium")
        return

    print("Checking DinoEnv compatibility with Gymnasium...")
    raw_env = DinoEnv()
    check_env(raw_env)
    print("Environment check passed! Standard Gymnasium interface confirmed.")

    env = Monitor(DinoEnv(ghost_mode=False, max_steps=5000))

    # PPO Hyperparameters matching Unit 1 best practices
    model = PPO(
        policy="MlpPolicy",
        env=env,
        learning_rate=3e-4,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.99,
        gae_lambda=0.95,
        clip_range=0.2,
        ent_coef=0.01,
        verbose=1,
    )

    print(f"\nStarting PPO training for {total_timesteps} timesteps...")
    model.learn(total_timesteps=total_timesteps)

    # Save trained model
    model.save(save_path)
    print(f"\nTrained policy saved to: {save_path}")

    # Evaluate trained model
    eval_env = Monitor(DinoEnv(ghost_mode=False, max_steps=5000))
    mean_reward, std_reward = evaluate_policy(model, eval_env, n_eval_episodes=10)
    print(f"Mean Reward over 10 test episodes: {mean_reward:.2f} +/- {std_reward:.2f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--timesteps", type=int, default=30_000, help="Total training timesteps")
    parser.add_argument("--save", type=str, default="ppo_dino.zip", help="Path to save weights")
    args = parser.parse_args()

    train_ppo(total_timesteps=args.timesteps, save_path=args.save)
