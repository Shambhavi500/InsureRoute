"""
pricing_engine.py — Dynamic insurance hedge cost calculator.

Formula
-------
Base Premium   = Cargo Value × Disruption Probability × 0.08
Weather Mult   = 1.4 if monsoon else 1.0
Perishable Mult= 1.6 if perishable else 1.0
Hedge Cost (H) = Base × Weather Mult × Perishable Mult

Also computes before/after rerouting comparison.
"""

from dataclasses import dataclass


@dataclass
class PriceResult:
    cargo_value: float
    disruption_probability: float
    base_premium: float
    weather_multiplier: float
    perishable_multiplier: float
    hedge_cost: float
    # After rerouting (lower probability)
    hedge_cost_after: float
    savings_pct: float
    savings_inr: float
    monsoon: bool
    perishable: bool


def compute_hedge(
    cargo_value: float,
    disruption_probability: float,
    monsoon: bool = False,
    perishable: bool = False,
    post_reroute_prob_reduction: float = 0.65,   # rerouting reduces risk by 65%
) -> PriceResult:
    """
    Compute hedge (insurance) cost before and after rerouting.

    Parameters
    ----------
    cargo_value            : ₹ value of cargo
    disruption_probability : model output in [0, 1]
    monsoon                : True if monsoon season / flag
    perishable             : True if commodity is perishable
    post_reroute_prob_reduction : fraction by which disruption prob drops after reroute
    """
    # ── Multipliers ───────────────────────────────────────────────────────────
    weather_mult = 1.4 if monsoon else 1.0
    perish_mult = 1.6 if perishable else 1.0

    # ── Before rerouting ─────────────────────────────────────────────────────
    base_premium = cargo_value * disruption_probability * 0.08
    hedge_before = base_premium * weather_mult * perish_mult

    # ── After rerouting (probability drops) ──────────────────────────────────
    prob_after = disruption_probability * (1 - post_reroute_prob_reduction)
    base_after = cargo_value * prob_after * 0.08
    hedge_after = base_after * weather_mult * perish_mult

    savings_inr = max(hedge_before - hedge_after, 0)
    savings_pct = (savings_inr / hedge_before * 100) if hedge_before > 0 else 0

    return PriceResult(
        cargo_value=round(cargo_value, 2),
        disruption_probability=round(disruption_probability, 4),
        base_premium=round(base_premium, 2),
        weather_multiplier=weather_mult,
        perishable_multiplier=perish_mult,
        hedge_cost=round(hedge_before, 2),
        hedge_cost_after=round(hedge_after, 2),
        savings_pct=round(savings_pct, 1),
        savings_inr=round(savings_inr, 2),
        monsoon=monsoon,
        perishable=perishable,
    )


# ── Demo scenario (Pune → Mumbai) ────────────────────────────────────────────
DEMO_SCENARIO = dict(
    cargo_value=70_000,
    disruption_probability=0.78,   # high risk
    monsoon=True,
    perishable=True,
)


def demo_run() -> PriceResult:
    return compute_hedge(**DEMO_SCENARIO)


if __name__ == "__main__":
    r = demo_run()
    print(f"Hedge BEFORE reroute: ₹{r.hedge_cost:,.2f}")
    print(f"Hedge AFTER  reroute: ₹{r.hedge_cost_after:,.2f}")
    print(f"Savings: ₹{r.savings_inr:,.2f} ({r.savings_pct}%)")
