"""
api.py — FastAPI bridge for the React frontend.

Run:  uvicorn backend.api:app --reload --port 8000
  OR: cd backend && uvicorn api:app --reload --port 8000
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random, time

from simulation import run_tick, get_summary_stats, _initialize
from graph_engine import get_node_positions, HUBS, get_graph

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="InsureRoute API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-warm the ML engine on startup
@app.on_event("startup")
async def startup():
    _initialize()


# ── Schemas ────────────────────────────────────────────────────────────────────
class DisruptionRequest(BaseModel):
    origin: str = "Pune_Hub"
    destination: str = "Mumbai_Hub"
    cargo_value: float = 70000
    monsoon: bool = True
    perishable: bool = True
    anomaly_threshold: float = -0.15


# ── Helpers ────────────────────────────────────────────────────────────────────
def build_graph_payload():
    G = get_graph()
    positions = get_node_positions()
    nodes = []
    for hub in HUBS:
        pos = positions.get(hub, (80.0, 20.0))
        nodes.append({"id": hub, "label": hub.replace("_", " "), "lon": pos[0], "lat": pos[1]})

    edges = []
    for src, dst, data in list(G.edges(data=True))[:200]:
        edges.append({
            "source": src,
            "target": dst,
            "weight": data.get("weight", 1),
            "distance": data.get("distance", 0),
        })
    return nodes, edges


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "ts": time.time()}


@app.get("/hubs")
def hubs():
    return {"hubs": HUBS}


@app.get("/data")
def get_data(
    origin: str = Query("Pune_Hub"),
    destination: str = Query("Mumbai_Hub"),
    cargo_value: float = Query(70000),
    monsoon: bool = Query(True),
    perishable: bool = Query(True),
    anomaly_threshold: float = Query(-0.15),
):
    tick = run_tick(
        origin=origin,
        destination=destination,
        cargo_value=cargo_value,
        monsoon=monsoon,
        perishable=perishable,
        inject_disruption=False,
        anomaly_threshold=anomaly_threshold,
    )
    stats = get_summary_stats()
    nodes, edges = build_graph_payload()

    return {
        "kpis": {
            "sla": stats["sla_breach_rate"],
            "delay": stats["avg_delay_pct"],
            "risk": round(tick["disruption_probability"] * 100, 1),
            "savings": tick["pricing"]["savings_pct"],
            "total_disruptions": stats["total_disruptions"],
            "total_shipments": stats["total_shipments"],
        },
        "insurance": {
            "cargo_value": tick["pricing"]["cargo_value"],
            "disruption_probability": tick["disruption_probability"],
            "base_premium": tick["pricing"]["base_premium"],
            "before_cost": tick["pricing"]["hedge_cost_before"],
            "after_cost": tick["pricing"]["hedge_cost_after"],
            "savings": tick["pricing"]["savings_inr"],
            "savings_pct": tick["pricing"]["savings_pct"],
            "weather_multiplier": tick["pricing"]["weather_multiplier"],
            "perishable_multiplier": tick["pricing"]["perishable_multiplier"],
        },
        "route": {
            **tick["route"],
            "disruption_detected": tick["disruption_detected"],
            "origin": tick["origin"],
            "destination": tick["destination"],
        },
        "anomaly_score": tick["anomaly_score"],
        "nodes": nodes,
        "edges": edges,
        "flags": tick["flags"],
        "raw": tick["raw_sample"],
    }


@app.post("/inject-disruption")
def inject_disruption(req: DisruptionRequest):
    tick = run_tick(
        origin=req.origin,
        destination=req.destination,
        cargo_value=req.cargo_value,
        monsoon=req.monsoon,
        perishable=req.perishable,
        inject_disruption=True,
        anomaly_threshold=req.anomaly_threshold,
    )
    stats = get_summary_stats()
    nodes, edges = build_graph_payload()

    return {
        "kpis": {
            "sla": stats["sla_breach_rate"],
            "delay": stats["avg_delay_pct"],
            "risk": round(tick["disruption_probability"] * 100, 1),
            "savings": tick["pricing"]["savings_pct"],
            "total_disruptions": stats["total_disruptions"],
            "total_shipments": stats["total_shipments"],
        },
        "insurance": {
            "cargo_value": tick["pricing"]["cargo_value"],
            "disruption_probability": tick["disruption_probability"],
            "base_premium": tick["pricing"]["base_premium"],
            "before_cost": tick["pricing"]["hedge_cost_before"],
            "after_cost": tick["pricing"]["hedge_cost_after"],
            "savings": tick["pricing"]["savings_inr"],
            "savings_pct": tick["pricing"]["savings_pct"],
            "weather_multiplier": tick["pricing"]["weather_multiplier"],
            "perishable_multiplier": tick["pricing"]["perishable_multiplier"],
        },
        "route": {
            **tick["route"],
            "disruption_detected": tick["disruption_detected"],
            "origin": tick["origin"],
            "destination": tick["destination"],
        },
        "anomaly_score": tick["anomaly_score"],
        "nodes": nodes,
        "edges": edges,
        "flags": tick["flags"],
        "raw": tick["raw_sample"],
        "injected": True,
    }
