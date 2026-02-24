"""
AgriSense Irrigation Gymnasium Environment
==========================================
A custom Gym environment simulating a 120-day crop growing season.
The agent learns an optimal irrigation schedule based on soil-water dynamics
derived from the FAO-56 Penman-Monteith model (simplified).

State Space (observation):
  [soil_moisture_pct, temperature_c, humidity_pct, rainfall_mm,
   crop_growth_stage_days, et0_mm_day, water_availability_idx]

Action Space (discrete):
  0 = No Irrigation
  1 = Irrigate 10mm
  2 = Irrigate 20mm
  3 = Irrigate 30mm

Reward:
  reward = yield_gain - water_penalty - stress_penalty
"""

import gymnasium as gym
from gymnasium import spaces
import numpy as np
import json
import random


# ---------------- Crop Coefficient Table (Kc) ----------------
# Kc values from FAO-56 for common crops across 3 growth stages
CROP_KC = {
    "wheat":   {"initial": 0.3, "mid": 1.15, "end": 0.4},
    "rice":    {"initial": 1.05, "mid": 1.20, "end": 0.90},
    "corn":    {"initial": 0.3, "mid": 1.20, "end": 0.60},
    "tomato":  {"initial": 0.6, "mid": 1.15, "end": 0.80},
    "cotton":  {"initial": 0.35, "mid": 1.20, "end": 0.60},
    "soybean": {"initial": 0.4, "mid": 1.15, "end": 0.50},
    "default": {"initial": 0.5, "mid": 1.10, "end": 0.60},
}

# Soil water holding capacity by soil type (mm/m)
SOIL_WHC = {
    "Sandy": 100, "Loamy": 150, "Clay": 180,
    "Black": 200, "Red": 130, "Mixed": 155, "Other": 140
}

SEASON_LENGTH = 120  # days


class IrrigationEnv(gym.Env):
    """
    Multi-agent compatible single-farm irrigation environment.
    One environment instance = one farm/agent.
    """
    metadata = {"render_modes": ["human"]}

    def __init__(self, farm_config: dict = None):
        super().__init__()

        # Farm parameters from AgriSense Farm model
        cfg = farm_config or {}
        self.crop = cfg.get("cropName", "wheat").lower()
        self.soil_type = cfg.get("soilType", "Loamy")
        self.water_avail = cfg.get("waterAvailability", "Medium")  # Low/Medium/High
        self.farm_area_ha = cfg.get("totalArea", 1.0)

        # Derived constants
        self.kc = CROP_KC.get(self.crop, CROP_KC["default"])
        self.whc = SOIL_WHC.get(self.soil_type, 150)  # mm water/m depth
        self.root_depth = 0.5   # m (grows over season)
        self.max_sm = self.whc * self.root_depth   # max soil moisture mm

        # Water availability index: Low=0.5, Medium=1.0, High=1.5
        self.water_mult = {"Low": 0.5, "Medium": 1.0, "High": 1.5}.get(self.water_avail, 1.0)

        # Action space: 4 discrete irrigation levels
        self.action_space = spaces.Discrete(4)
        self.action_mm = [0, 10, 20, 30]

        # Observation space: 7 normalized floats in [0, 1]
        self.observation_space = spaces.Box(
            low=np.zeros(7, dtype=np.float32),
            high=np.ones(7, dtype=np.float32),
            dtype=np.float32
        )

        # Episode tracking
        self.day = 0
        self.soil_moisture = 0.0
        self.cumulative_water_used = 0.0
        self.cumulative_stress_days = 0
        self.cumulative_yield_score = 0.0
        self.episode_log = []

        # Simulated weather profile (will be reset each episode)
        self.weather_profile = []

    # ------------------------------------------------------------------
    def _generate_weather(self):
        """Generates a stochastic but realistic 120-day weather profile."""
        profile = []
        for day in range(SEASON_LENGTH):
            # Seasonal temperature variation
            base_temp = 25 + 5 * np.sin(2 * np.pi * day / SEASON_LENGTH)
            temp = float(np.clip(np.random.normal(base_temp, 3), 10, 45))
            humidity = float(np.clip(np.random.normal(60, 15), 20, 95))
            wind_ms = float(np.clip(np.random.normal(3, 1.5), 0.5, 10))

            # Rainfall: sparse but occasional showers
            rainfall = float(np.random.choice(
                [0, 0, 0, 0, 0, random.uniform(5, 30)],
                p=[0.5, 0.15, 0.10, 0.10, 0.05, 0.10]
            ))

            et0 = self._calc_et0(temp, humidity, wind_ms)
            profile.append({
                "temp": temp, "humidity": humidity,
                "wind_ms": wind_ms, "rainfall": rainfall, "et0": et0
            })
        return profile

    def _calc_et0(self, temp: float, humidity: float, wind_ms: float) -> float:
        """
        Simplified FAO-56 ET0 formula (Hargreaves-Samani variant).
        Full Penman-Monteith needs radiation data not always available.
        ET0 = 0.0023 * (T + 17.78) * sqrt(T) * (1 + (100 - H)/100) * (1 + u/10)
        """
        et0 = 0.0023 * (temp + 17.78) * np.sqrt(max(temp, 0)) * \
              (1 + (100 - humidity) / 100) * (1 + wind_ms / 10)
        return float(round(max(et0, 0), 2))

    def _get_kc(self) -> float:
        """Returns crop coefficient based on current growth stage."""
        stage_day = self.day / SEASON_LENGTH
        if stage_day < 0.25:
            return self.kc["initial"]
        elif stage_day < 0.75:
            return self.kc["mid"]
        else:
            return self.kc["end"]

    def _get_observation(self) -> np.ndarray:
        """Returns normalized observation vector."""
        w = self.weather_profile[min(self.day, SEASON_LENGTH - 1)]
        water_avail_idx = {"Low": 0.0, "Medium": 0.5, "High": 1.0}.get(self.water_avail, 0.5)
        obs = np.array([
            np.clip(self.soil_moisture / self.max_sm, 0, 1),   # soil moisture %
            np.clip((w["temp"] - 10) / 35, 0, 1),              # temperature normalized
            np.clip(w["humidity"] / 100, 0, 1),                 # humidity
            np.clip(w["rainfall"] / 30, 0, 1),                  # rainfall
            np.clip(self.day / SEASON_LENGTH, 0, 1),            # growth stage
            np.clip(w["et0"] / 8, 0, 1),                        # ET0 normalized
            water_avail_idx                                      # water availability
        ], dtype=np.float32)
        return obs

    # ------------------------------------------------------------------
    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.day = 0
        self.soil_moisture = self.max_sm * random.uniform(0.4, 0.7)  # start 40-70% full
        self.cumulative_water_used = 0.0
        self.cumulative_stress_days = 0
        self.cumulative_yield_score = 0.0
        self.episode_log = []
        self.weather_profile = self._generate_weather()
        return self._get_observation(), {}

    def step(self, action: int):
        assert self.action_space.contains(action), f"Invalid action: {action}"

        w = self.weather_profile[self.day]
        kc = self._get_kc()
        et_crop = kc * w["et0"]  # Actual crop evapotranspiration (mm/day)

        # Irrigation applied (limited by water availability multiplier)
        irrigation_mm = self.action_mm[action] * self.water_mult
        self.cumulative_water_used += irrigation_mm

        # Water balance update
        self.soil_moisture += w["rainfall"] + irrigation_mm - et_crop
        self.soil_moisture = float(np.clip(self.soil_moisture, 0, self.max_sm))

        # Stress calculation: soil_moisture below 40% triggers stress
        threshold = self.max_sm * 0.40
        water_stress = max(0.0, (threshold - self.soil_moisture) / threshold)
        if water_stress > 0.2:
            self.cumulative_stress_days += 1

        # Yield contribution this day (Ky method from FAO-56)
        # Ky = 1.0 for most crops (yield response factor)
        daily_yield_factor = max(0, 1.0 - 1.0 * water_stress)
        self.cumulative_yield_score += daily_yield_factor

        # Reward components
        yield_reward = daily_yield_factor * 2.0
        water_penalty = (irrigation_mm / 30) * 0.5  # penalize overuse
        stress_penalty = water_stress * 3.0          # heavily penalize stress

        reward = float(yield_reward - water_penalty - stress_penalty)

        # Log step
        self.episode_log.append({
            "day": int(self.day), "action": int(action), "irrigation_mm": float(irrigation_mm),
            "soil_moisture": float(round(self.soil_moisture, 2)),
            "et_crop": float(round(et_crop, 2)), "rain": float(round(w["rainfall"], 2)),
            "water_stress": float(round(water_stress, 3)), "reward": float(round(reward, 3))
        })

        self.day += 1
        terminated = self.day >= SEASON_LENGTH
        truncated = False

        obs = self._get_observation()

        info = {}
        if terminated:
            info = {
                "total_water_used_mm": round(self.cumulative_water_used, 1),
                "stress_days": self.cumulative_stress_days,
                "yield_score": round(self.cumulative_yield_score, 2),
                "max_possible_yield": float(SEASON_LENGTH),
                "water_efficiency": round(self.cumulative_yield_score / max(self.cumulative_water_used, 1), 4)
            }

        return obs, reward, terminated, truncated, info

    def render(self, mode="human"):
        if self.episode_log:
            last = self.episode_log[-1]
            print(f"Day {last['day']:03d} | SM: {last['soil_moisture']:6.1f}mm | "
                  f"Action: {last['action']} ({self.action_mm[last['action']]}mm) | "
                  f"Reward: {last['reward']:+.3f} | Stress: {last['water_stress']:.2f}")
