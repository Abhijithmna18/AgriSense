"""
Training Script — AgriSense RL Irrigation
==========================================
Trains both Q-Learning and PPO agents on IrrigationEnv.
Saves trained models and logs full reward curves to JSON
for research comparison and dashboard visualization.

Usage:
  python train.py --episodes 500 --agent both
  python train.py --episodes 500 --agent ql
  python train.py --episodes 500 --agent ppo
"""

import argparse
import json
import os
import time
import numpy as np

from environment import IrrigationEnv
from agents.q_learning_agent import QLearningAgent

MODELS_DIR = "models"
RESULTS_PATH = "models/training_results.json"

# Default farm config (matches AgriSense Farm model schema)
DEFAULT_FARM_CONFIG = {
    "cropName": "wheat",
    "soilType": "Loamy",
    "waterAvailability": "Medium",
    "totalArea": 1.0,
}


def train_q_learning(episodes: int, farm_config: dict) -> dict:
    """Train the Q-Learning agent and return metrics."""
    print(f"\n{'='*50}")
    print(f"[Q-Learning] Starting training: {episodes} episodes")
    print(f"{'='*50}")

    env = IrrigationEnv(farm_config)
    agent = QLearningAgent(
        n_actions=4, n_bins=5, n_obs=7,
        learning_rate=0.1, discount=0.95,
        epsilon_start=1.0, epsilon_end=0.05, epsilon_decay=0.993
    )

    start_time = time.time()
    episode_rewards = []
    episode_water = []
    episode_stress = []

    for ep in range(episodes):
        obs, _ = env.reset()
        total_reward = 0.0
        done = False

        while not done:
            action = agent.get_action(obs)
            next_obs, reward, terminated, truncated, info = env.step(action)
            agent.update(obs, action, reward, next_obs, terminated or truncated)
            obs = next_obs
            total_reward += reward
            done = terminated or truncated

        agent.decay_epsilon()
        agent.record_episode(total_reward)
        episode_rewards.append(round(total_reward, 3))
        if info:
            episode_water.append(info.get("total_water_used_mm", 0))
            episode_stress.append(info.get("stress_days", 0))

        # Progress logging
        if (ep + 1) % 50 == 0:
            avg = np.mean(episode_rewards[-50:])
            print(f"  Episode {ep+1:4d}/{episodes} | Avg Reward: {avg:8.3f} | ε={agent.epsilon:.3f}")

    elapsed = round(time.time() - start_time, 1)
    print(f"[Q-Learning] ✅ Done in {elapsed}s")

    os.makedirs(MODELS_DIR, exist_ok=True)
    agent.save(os.path.join(MODELS_DIR, "q_learning_model.json"))

    metrics = agent.get_metrics()
    metrics["training_time_s"] = elapsed
    metrics["episode_water_mm"] = episode_water
    metrics["episode_stress_days"] = episode_stress
    return metrics


def train_ppo(episodes: int, farm_config: dict) -> dict:
    """Train the PPO agent and return metrics."""
    print(f"\n{'='*50}")
    print(f"[PPO] Starting training for ~{episodes} episodes")
    print(f"{'='*50}")

    try:
        from agents.ppo_agent import PPOAgent
    except ImportError as e:
        print(f"[PPO] SKIP: {e}")
        return {"agent": "PPO", "error": str(e), "reward_history": []}

    env = IrrigationEnv(farm_config)
    agent = PPOAgent(env=env, learning_rate=3e-4, n_steps=256, batch_size=64, verbose=0)

    start_time = time.time()
    total_timesteps = episodes * 120  # approx episodes × season_length

    agent.train(total_timesteps=total_timesteps)
    elapsed = round(time.time() - start_time, 1)
    print(f"[PPO] ✅ Done in {elapsed}s")

    os.makedirs(MODELS_DIR, exist_ok=True)
    agent.save(os.path.join(MODELS_DIR, "ppo_model"))

    metrics = agent.get_metrics()
    metrics["training_time_s"] = elapsed
    return metrics


def compare_agents(ql_metrics: dict, ppo_metrics: dict) -> dict:
    """Build a research comparison table."""
    results = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "agents": {
            "q_learning": ql_metrics,
            "ppo": ppo_metrics,
        },
        "comparison": {}
    }

    ql_r = np.array(ql_metrics.get("reward_history", []))
    ppo_r = np.array(ppo_metrics.get("reward_history", []))

    if len(ql_r) > 0 and len(ppo_r) > 0:
        results["comparison"] = {
            "final_avg_reward": {
                "q_learning": float(round(np.mean(ql_r[-50:]), 3)),
                "ppo": float(round(np.mean(ppo_r[-50:]), 3)),
                "winner": "PPO" if np.mean(ppo_r[-50:]) > np.mean(ql_r[-50:]) else "Q-Learning"
            },
            "max_reward": {
                "q_learning": float(round(np.max(ql_r), 3)),
                "ppo": float(round(np.max(ppo_r), 3)),
            },
            "convergence_episode": {
                "q_learning": ql_metrics.get("convergence_episode", -1),
                "ppo": ppo_metrics.get("convergence_episode", -1),
            },
            "training_time_s": {
                "q_learning": ql_metrics.get("training_time_s", 0),
                "ppo": ppo_metrics.get("training_time_s", 0),
            }
        }

    return results


def main():
    parser = argparse.ArgumentParser(description="Train RL Irrigation Agents")
    parser.add_argument("--episodes", type=int, default=500, help="Number of training episodes")
    parser.add_argument("--agent", choices=["ql", "ppo", "both"], default="both")
    parser.add_argument("--crop", type=str, default="wheat")
    parser.add_argument("--soil", type=str, default="Loamy")
    parser.add_argument("--water", type=str, default="Medium", choices=["Low", "Medium", "High"])
    args = parser.parse_args()

    farm_config = {
        "cropName": args.crop,
        "soilType": args.soil,
        "waterAvailability": args.water,
        "totalArea": 1.0,
    }

    ql_metrics = {}
    ppo_metrics = {}

    if args.agent in ["ql", "both"]:
        ql_metrics = train_q_learning(args.episodes, farm_config)

    if args.agent in ["ppo", "both"]:
        ppo_metrics = train_ppo(args.episodes, farm_config)

    if args.agent == "both":
        results = compare_agents(ql_metrics, ppo_metrics)
        os.makedirs(MODELS_DIR, exist_ok=True)
        with open(RESULTS_PATH, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\n[Results] ✅ Saved comparison to {RESULTS_PATH}")

        # Print summary table
        comp = results.get("comparison", {})
        if comp:
            print("\n" + "="*55)
            print("  RESEARCH COMPARISON SUMMARY")
            print("="*55)
            fr = comp.get("final_avg_reward", {})
            print(f"  Final Avg Reward  | Q-Learning: {fr.get('q_learning','N/A'):>8} | PPO: {fr.get('ppo','N/A'):>8}")
            tt = comp.get("training_time_s", {})
            print(f"  Training Time (s) | Q-Learning: {tt.get('q_learning','N/A'):>8} | PPO: {tt.get('ppo','N/A'):>8}")
            ce = comp.get("convergence_episode", {})
            print(f"  Convergence Ep.   | Q-Learning: {ce.get('q_learning','N/A'):>8} | PPO: {ce.get('ppo','N/A'):>8}")
            print(f"  Winner            | {fr.get('winner', 'N/A')}")
            print("="*55)


if __name__ == "__main__":
    main()
