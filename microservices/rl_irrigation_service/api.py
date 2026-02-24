"""
FastAPI Microservice — AgriSense RL Irrigation Service
=======================================================
Exposes the trained RL agents via REST API.
The Node.js backend calls this service to get irrigation recommendations.

Endpoints:
  POST /rl/step           — Get agent action for a given state
  GET  /rl/metrics        — Return reward history for dashboard chart
  GET  /rl/compare        — Return Q-Learning vs PPO research comparison table
  GET  /rl/health         — Health check
  POST /rl/simulate       — Run a full 120-day episode simulation

Run:
  uvicorn api:app --host 0.0.0.0 --port 8001 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import numpy as np
import json
import os

from environment import IrrigationEnv
from agents.q_learning_agent import QLearningAgent

MODELS_DIR = "models"
RESULTS_PATH = os.path.join(MODELS_DIR, "training_results.json")
QL_MODEL_PATH = os.path.join(MODELS_DIR, "q_learning_model.json")

app = FastAPI(
    title="AgriSense RL Irrigation Service",
    description="Multi-Agent RL for optimal irrigation scheduling (Q-Learning vs PPO research)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load agents at startup ----
q_agent: Optional[QLearningAgent] = None
ppo_agent = None  # loaded lazily


def _load_agents():
    global q_agent, ppo_agent

    if os.path.exists(QL_MODEL_PATH):
        try:
            q_agent = QLearningAgent.load(QL_MODEL_PATH)
            print(f"[API] ✅ Q-Learning agent loaded from {QL_MODEL_PATH}")
        except Exception as e:
            print(f"[API] ⚠️  Could not load Q-Learning model: {e}")
    else:
        # Create an untrained agent for demo purposes
        q_agent = QLearningAgent()
        print("[API] ⚠️  No trained Q-Learning model found. Using fresh agent (train first!)")

    # Try PPO
    ppo_model_path = os.path.join(MODELS_DIR, "ppo_model.zip")
    if os.path.exists(ppo_model_path):
        try:
            from agents.ppo_agent import PPOAgent
            dummy_env = IrrigationEnv()
            ppo_agent = PPOAgent.load(ppo_model_path, dummy_env)
            print(f"[API] ✅ PPO agent loaded from {ppo_model_path}")
        except Exception as e:
            print(f"[API] ⚠️  Could not load PPO model: {e}")


_load_agents()


# ---- Request / Response Models ----

class StateInput(BaseModel):
    """Observation vector from the AgriSense Node.js backend."""
    soil_moisture_pct: float = Field(..., ge=0.0, le=1.0, description="Soil moisture [0-1]")
    temperature_norm: float = Field(..., ge=0.0, le=1.0, description="Temperature normalized [0-1]")
    humidity_norm: float = Field(..., ge=0.0, le=1.0, description="Humidity [0-1]")
    rainfall_norm: float = Field(..., ge=0.0, le=1.0, description="Rainfall [0-1]")
    growth_stage: float = Field(..., ge=0.0, le=1.0, description="Days elapsed / 120 [0-1]")
    et0_norm: float = Field(..., ge=0.0, le=1.0, description="ET0 normalized [0-1]")
    water_availability: float = Field(..., ge=0.0, le=1.0, description="Water availability [0=Low, 0.5=Medium, 1=High]")
    agent: str = Field("ql", description="Agent to use: 'ql' or 'ppo'")


class FarmConfig(BaseModel):
    cropName: str = "wheat"
    soilType: str = "Loamy"
    waterAvailability: str = "Medium"
    totalArea: float = 1.0


class SimulateRequest(BaseModel):
    farm_config: FarmConfig = FarmConfig()
    agent: str = "ql"
    episodes: int = Field(1, ge=1, le=10)


# ---- Action Labels ----
ACTION_LABELS = {
    0: "No Irrigation",
    1: "Irrigate 10mm",
    2: "Irrigate 20mm",
    3: "Irrigate 30mm",
}
ACTION_MM = [0, 10, 20, 30]


# ---- Endpoints ----

@app.get("/rl/health")
def health():
    return {
        "status": "ok",
        "q_agent_loaded": q_agent is not None,
        "ppo_agent_loaded": ppo_agent is not None,
        "model_trained": os.path.exists(QL_MODEL_PATH),
    }


@app.post("/rl/step")
def step(payload: StateInput):
    """
    Get irrigation recommendation for the current field state.
    Called by the AgriSense Node.js backend every day/hour.
    """
    obs = np.array([
        payload.soil_moisture_pct,
        payload.temperature_norm,
        payload.humidity_norm,
        payload.rainfall_norm,
        payload.growth_stage,
        payload.et0_norm,
        payload.water_availability,
    ], dtype=np.float32)

    if payload.agent == "ppo" and ppo_agent is not None:
        action = ppo_agent.get_action(obs, greedy=True)
        agent_name = "PPO"
    elif q_agent is not None:
        action = q_agent.get_action(obs, greedy=True)
        agent_name = "Q-Learning"
    else:
        raise HTTPException(status_code=503, detail="No agent loaded. Run train.py first.")

    # Confidence: how dominant is the best action?
    if q_agent:
        state = q_agent._discretize(obs)
        q_vals = q_agent.q_table[state]
        best_q = np.max(q_vals)
        q_range = np.max(q_vals) - np.min(q_vals)
        confidence = float(round(min(1.0, q_range / (abs(best_q) + 1e-6)), 2)) if q_range > 0 else 0.5
    else:
        confidence = 0.75

    return {
        "action": int(action),
        "action_label": ACTION_LABELS.get(action, "Unknown"),
        "irrigation_mm": ACTION_MM[action],
        "confidence": confidence,
        "agent": agent_name,
        "reasoning": _generate_reasoning(payload, action),
    }


def _generate_reasoning(state: StateInput, action: int) -> str:
    reasons = []
    if state.soil_moisture_pct < 0.35:
        reasons.append("soil moisture critically low")
    elif state.soil_moisture_pct > 0.80:
        reasons.append("soil moisture adequate — no irrigation needed")
    if state.rainfall_norm > 0.3:
        reasons.append("rainfall expected — reduced irrigation")
    if state.et0_norm > 0.7:
        reasons.append("high evaporation rate today")
    if state.water_availability < 0.3:
        reasons.append("limited water supply — conservative schedule")
    if not reasons:
        reasons.append("standard conditions — scheduled irrigation")
    return "; ".join(reasons).capitalize() + "."


@app.get("/rl/metrics")
def get_metrics():
    """Returns training reward history for both agents for dashboard charts."""
    results = {}

    if q_agent and q_agent.reward_history:
        results["q_learning"] = {
            "reward_history": q_agent.reward_history,
            "final_avg_reward": round(np.mean(q_agent.reward_history[-50:]), 3),
        }

    if ppo_agent and ppo_agent.reward_history:
        results["ppo"] = {
            "reward_history": ppo_agent.reward_history,
            "final_avg_reward": round(np.mean(ppo_agent.reward_history[-50:]), 3),
        }

    if os.path.exists(RESULTS_PATH):
        with open(RESULTS_PATH, "r") as f:
            results["training_results"] = json.load(f)

    if not results:
        raise HTTPException(status_code=404, detail="No training data found. Run train.py first.")

    return results


@app.get("/rl/compare")
def compare():
    """Returns the research comparison table generated by train.py."""
    if not os.path.exists(RESULTS_PATH):
        raise HTTPException(
            status_code=404,
            detail="No comparison data. Run: python train.py --agent both --episodes 500"
        )
    with open(RESULTS_PATH, "r") as f:
        return json.load(f)


@app.post("/rl/simulate")
def simulate(request: SimulateRequest):
    """
    Run a full 120-day episode and return the daily log.
    Useful for the dashboard visualization and research data collection.
    """
    env = IrrigationEnv(request.farm_config.dict())
    obs, _ = env.reset()

    episode_logs = []
    total_reward = 0.0

    for _ in range(120):
        if request.agent == "ppo" and ppo_agent:
            action = ppo_agent.get_action(obs, greedy=True)
        elif q_agent:
            action = q_agent.get_action(obs, greedy=True)
        else:
            action = 0  # no-op fallback

        obs, reward, terminated, truncated, info = env.step(action)
        total_reward += reward

        if env.episode_log:
            episode_logs.append(env.episode_log[-1])

        if terminated or truncated:
            break

    return {
        "farm_config": request.farm_config.dict(),
        "agent": request.agent,
        "total_reward": round(total_reward, 3),
        "final_info": info,
        "daily_log": episode_logs,
    }
