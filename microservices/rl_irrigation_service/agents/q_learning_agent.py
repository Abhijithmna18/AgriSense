"""
Tabular Q-Learning Agent for Irrigation Optimization
=====================================================
Research Baseline: Pure tabular Q-learning with ε-greedy exploration.
State space is discretized into bins to create a finite Q-table.

This is the COMPARISON agent against PPO (stable-baselines3).
Key limitation: curse of dimensionality for large state spaces.
"""

import numpy as np
import json
import os


class QLearningAgent:
    """
    Tabular Q-Learning agent.
    
    State discretization: 7 features × N bins each = N^7 states
    We use 5 bins per feature → 5^7 = 78,125 states (manageable).
    """

    def __init__(
        self,
        n_actions: int = 4,
        n_bins: int = 5,
        n_obs: int = 7,
        learning_rate: float = 0.1,
        discount: float = 0.95,
        epsilon_start: float = 1.0,
        epsilon_end: float = 0.05,
        epsilon_decay: float = 0.995,
    ):
        self.n_actions = n_actions
        self.n_bins = n_bins
        self.n_obs = n_obs
        self.lr = learning_rate
        self.gamma = discount
        self.epsilon = epsilon_start
        self.epsilon_end = epsilon_end
        self.epsilon_decay = epsilon_decay

        # Initialize Q-table with small random values
        table_shape = tuple([n_bins] * n_obs + [n_actions])
        self.q_table = np.random.uniform(low=-0.01, high=0.01, size=table_shape)

        # Bin edges for discretization (features are already [0,1])
        self.bin_edges = np.linspace(0.0, 1.0, n_bins + 1)[1:-1]  # inner edges

        # Training history
        self.reward_history = []
        self.epsilon_history = []

    def _discretize(self, obs: np.ndarray) -> tuple:
        """Convert continuous [0,1] observation to discrete bin indices."""
        discretized = []
        for val in obs:
            bin_idx = int(np.digitize(float(val), self.bin_edges))
            bin_idx = np.clip(bin_idx, 0, self.n_bins - 1)
            discretized.append(bin_idx)
        return tuple(discretized)

    def get_action(self, obs: np.ndarray, greedy: bool = False) -> int:
        """ε-greedy action selection."""
        if not greedy and np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        state = self._discretize(obs)
        return int(np.argmax(self.q_table[state]))

    def update(self, obs: np.ndarray, action: int, reward: float,
               next_obs: np.ndarray, done: bool):
        """Standard Q-Learning Bellman update."""
        state = self._discretize(obs)
        next_state = self._discretize(next_obs)

        current_q = self.q_table[state + (action,)]
        if done:
            target_q = reward
        else:
            target_q = reward + self.gamma * np.max(self.q_table[next_state])

        # Q-table update
        self.q_table[state + (action,)] += self.lr * (target_q - current_q)

    def decay_epsilon(self):
        """Decay exploration rate."""
        self.epsilon = max(self.epsilon_end, self.epsilon * self.epsilon_decay)

    def record_episode(self, total_reward: float):
        """Log episode reward."""
        self.reward_history.append(float(round(total_reward, 3)))
        self.epsilon_history.append(float(round(self.epsilon, 4)))

    def save(self, path: str):
        """Save Q-table and config to JSON (lightweight)."""
        os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
        data = {
            "q_table": self.q_table.tolist(),
            "reward_history": self.reward_history,
            "epsilon_history": self.epsilon_history,
            "config": {
                "n_actions": self.n_actions,
                "n_bins": self.n_bins,
                "n_obs": self.n_obs,
                "lr": self.lr,
                "gamma": self.gamma,
            }
        }
        with open(path, "w") as f:
            json.dump(data, f)
        print(f"[Q-Learning] ✅ Saved to {path}")

    @classmethod
    def load(cls, path: str) -> "QLearningAgent":
        """Load from saved JSON."""
        with open(path, "r") as f:
            data = json.load(f)
        cfg = data["config"]
        agent = cls(
            n_actions=cfg["n_actions"],
            n_bins=cfg["n_bins"],
            n_obs=cfg["n_obs"],
            learning_rate=cfg["lr"],
            discount=cfg["gamma"],
        )
        agent.q_table = np.array(data["q_table"])
        agent.reward_history = data["reward_history"]
        agent.epsilon_history = data["epsilon_history"]
        agent.epsilon = agent.epsilon_end  # greedy mode after load
        return agent

    def get_metrics(self) -> dict:
        """Return summary statistics for research comparison."""
        if not self.reward_history:
            return {}
        rewards = np.array(self.reward_history)
        # Rolling average (last 50 episodes)
        window = min(50, len(rewards))
        rolling_avg = float(np.mean(rewards[-window:]))
        return {
            "agent": "Q-Learning",
            "total_episodes": len(rewards),
            "final_avg_reward": rolling_avg,
            "max_reward": float(np.max(rewards)),
            "min_epsilon": float(self.epsilon),
            "convergence_episode": self._find_convergence(),
            "reward_history": self.reward_history,
            "epsilon_history": self.epsilon_history,
        }

    def _find_convergence(self, threshold: float = 0.02, window: int = 30) -> int:
        """Find the episode index where reward stabilizes (std < threshold)."""
        rewards = np.array(self.reward_history)
        for i in range(window, len(rewards)):
            if np.std(rewards[i - window:i]) < threshold * abs(np.mean(rewards[i - window:i]) + 1e-6):
                return i
        return -1  # did not converge
