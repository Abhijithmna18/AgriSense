"""
PPO Agent Wrapper for Irrigation Optimization
==============================================
Research Agent: Uses Proximal Policy Optimization via stable-baselines3.
Handles continuous observation space with deep neural networks.
This is the BENCHMARK agent compared against tabular Q-Learning.

PPO advantages for this problem:
- Scales to the 7-dimensional continuous state space
- Does NOT require discretization (no info loss)
- Stable training via clipped surrogate objective
"""

import os
import json
import numpy as np

# stable-baselines3 for PPO
try:
    from stable_baselines3 import PPO as SB3_PPO
    from stable_baselines3.common.callbacks import EvalCallback
    from stable_baselines3.common.monitor import Monitor
    SB3_AVAILABLE = True
except ImportError:
    SB3_AVAILABLE = False
    print("[PPO] WARNING: stable-baselines3 not installed. Run: pip install stable-baselines3")


class PPOAgent:
    """
    Wrapper around stable-baselines3 PPO for the IrrigationEnv.
    Stores reward history in the same format as QLearningAgent
    for easy research comparison.
    """

    def __init__(
        self,
        env,
        learning_rate: float = 3e-4,
        n_steps: int = 256,
        batch_size: int = 64,
        n_epochs: int = 10,
        gamma: float = 0.95,
        gae_lambda: float = 0.95,
        clip_range: float = 0.2,
        verbose: int = 0,
    ):
        if not SB3_AVAILABLE:
            raise ImportError("stable-baselines3 required. Install: pip install stable-baselines3 torch")

        self.env = env
        self.reward_history = []

        # Wrap env in Monitor to capture episode rewards
        self.monitored_env = Monitor(env)

        self.model = SB3_PPO(
            "MlpPolicy",
            self.monitored_env,
            learning_rate=learning_rate,
            n_steps=n_steps,
            batch_size=batch_size,
            n_epochs=n_epochs,
            gamma=gamma,
            gae_lambda=gae_lambda,
            clip_range=clip_range,
            verbose=verbose,
            policy_kwargs={"net_arch": [64, 64]},  # 2-layer MLP
        )

    def train(self, total_timesteps: int = 60000):
        """Train PPO for given total timesteps (≈ 500 episodes × 120 days)."""
        print(f"[PPO] Starting training for {total_timesteps} timesteps...")
        self.model.learn(total_timesteps=total_timesteps, reset_num_timesteps=True)

        # Extract reward history from monitor
        if hasattr(self.monitored_env, "get_episode_rewards"):
            self.reward_history = [float(r) for r in self.monitored_env.get_episode_rewards()]
        print(f"[PPO] Training complete. Episodes: {len(self.reward_history)}")

    def get_action(self, obs: np.ndarray, greedy: bool = True) -> int:
        """Get best action for a given observation."""
        action, _ = self.model.predict(obs, deterministic=greedy)
        return int(action)

    def save(self, path: str):
        """Save PPO model (creates .zip file via SB3)."""
        os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
        self.model.save(path)
        # Save reward history separately
        history_path = path.replace(".zip", "") + "_history.json"
        with open(history_path, "w") as f:
            json.dump({"reward_history": self.reward_history}, f)
        print(f"[PPO] ✅ Model saved to {path}, history to {history_path}")

    @classmethod
    def load(cls, path: str, env) -> "PPOAgent":
        """Load from saved SB3 model."""
        agent = cls.__new__(cls)
        agent.env = env
        agent.monitored_env = Monitor(env)
        agent.model = SB3_PPO.load(path, env=agent.monitored_env)
        history_path = path.replace(".zip", "") + "_history.json"
        if os.path.exists(history_path):
            with open(history_path, "r") as f:
                agent.reward_history = json.load(f)["reward_history"]
        else:
            agent.reward_history = []
        return agent

    def get_metrics(self) -> dict:
        """Return summary metrics matching Q-Learning format for comparison."""
        if not self.reward_history:
            return {"agent": "PPO", "error": "Not trained yet"}
        rewards = np.array(self.reward_history)
        window = min(50, len(rewards))
        rolling_avg = float(np.mean(rewards[-window:]))
        return {
            "agent": "PPO (stable-baselines3)",
            "total_episodes": len(rewards),
            "final_avg_reward": rolling_avg,
            "max_reward": float(np.max(rewards)),
            "convergence_episode": self._find_convergence(rewards),
            "reward_history": self.reward_history,
        }

    def _find_convergence(self, rewards: np.ndarray, window: int = 30) -> int:
        for i in range(window, len(rewards)):
            if np.std(rewards[i - window:i]) < 0.5:
                return i
        return -1
