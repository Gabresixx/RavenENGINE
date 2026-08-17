# RAVEN Architecture

RAVEN is a WebGL2-first runtime engine built around **compiled procedural assets**, **shared world fields**, and **strict frame budgets**.

## Layers

1. **Core Runtime** — clocks, scheduler, jobs, events, telemetry, deterministic RNG.
2. **Renderer** — WebGL2 device, resource ownership, render graph, passes, dynamic resolution.
3. **World** — sectors, world fields, deterministic persistence, visibility and HLOD contracts.
4. **Asset Compiler** — procedural descriptions -> transient construction data -> baked runtime meshes/materials/LODs.
5. **Surface System** — physically meaningful material traits and mutable surface state.
6. **Animation** — skeletons, pose buffers, constraints, contact-aware procedural motion.
7. **Quality** — budgets, degradation ladders, watchdogs and adaptive quality.

## Non-negotiable invariants

- No subsystem may assume WebGPU.
- Construction geometry must not remain live after an asset is baked unless explicitly marked dynamic.
- Expensive work must be schedulable and budgeted.
- World state is deterministic from seed + persisted deltas.
- Visual detail must be driven by projected importance, not only Euclidean distance.
- Stable frame pacing is a feature, not a post-launch optimization task.
