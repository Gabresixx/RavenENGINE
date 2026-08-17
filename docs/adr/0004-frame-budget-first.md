# ADR 0004 — Frame-budget-first scheduling

Status: Accepted

RAVEN must degrade quality before destabilizing frame time. Generation, simulation and visual effects expose costs and participate in explicit budgets. Long-running work is chunked or moved to workers when possible.
