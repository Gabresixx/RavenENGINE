# RAVEN Master Plan

## Mission

RAVEN is a **3D high-fidelity, procedural-first runtime engine** for modern high-end/AAA-class rendering and simulation. It is not a universal 2D/application framework and it is not the engine of any specific game.

Public AAA technology from Rockstar/RAGE, Naughty Dog and other production engines is used as an engineering benchmark. Benchmark vocabulary and game-domain behavior must never leak into the engine core.

The native content path is:

`recipe + shared world fields -> procedural geometry/material/rig/state -> compiled runtime asset -> LOD/HLOD/cache -> runtime scene`

Imported assets may exist as interoperability, but they are not the architectural center of RAVEN.

---

## Phase 0 — FOUNDATION — 100% VERIFIED / FROZEN

The foundation is the contract beneath all production subsystems. It is complete when the Node 20 and Node 22 CI matrix passes, in order:

1. `pnpm verify:foundation`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`

### Frozen foundation contracts

- platform/browser globals stay isolated behind `@raven/platform`;
- deterministic clocks, RNG, ECS ordering, snapshots and content paths;
- explicit resource ownership, scopes, bounded queues and memory budgets;
- dependency-ordered lifecycle/module graph and fault boundaries;
- injected timing and worker creation instead of hidden browser globals;
- versioned persistence with checksums and forward-skippable unknown payloads;
- capability-driven backend contracts;
- low-level package dependency direction enforced by machine audit;
- domain-neutral engine core;
- `Math.random()` forbidden in engine packages;
- expensive work schedulable and budgeted;
- Node 20/22 verification gate mandatory for every future integration.

**Frozen does not mean immutable code.** A foundation contract may change only through a deliberate architectural change with an ADR, migration/compatibility plan where required, tests, and a fully green foundation gate. Feature work must not casually redesign the foundation.

---

## Phase 1 — Production Renderer

### Goal
Turn the existing WebGL2 renderer spine into a production-quality high-fidelity frame pipeline without changing scene extraction contracts.

### Work
- frame-graph integration of production passes and resource lifetime tracking;
- physically coherent opaque PBR path and material feature variants;
- cascaded directional shadows plus contact-shadow refinement;
- tiled/cluster-aware local light submission and bounded light lists;
- depth pyramid and visibility/occlusion infrastructure;
- temporal history, motion/reactive data and temporal reconstruction policy;
- GTAO/SSAO quality ladder with temporal stabilization;
- selective SSR and reflection hierarchy with graceful fallbacks;
- atmosphere, fog, froxel/volumetric lighting infrastructure;
- exposure, tonemapping, bloom and final presentation pipeline;
- GPU timings, pass budgets, dynamic resolution and quality degradation integrated into the frame graph.

### Exit gate
The Lab must render a representative high-fidelity validation scene through the public engine path with stable frame pacing, deterministic scene submission, bounded GPU resources and no renderer-specific shortcuts in game/demo code.

---

## Phase 2 — Procedural Production

### Goal
Make procedural generation capable of producing authored-looking production assets instead of visible primitive assemblies.

### Work
- topology-producing architectural generation with real openings/reveals/interiors;
- production hard-surface profile/loft/boolean-style construction paths;
- terrain and large-surface compilation driven by fields;
- vegetation/ecology distribution with deterministic variation;
- material recipes producing physically meaningful layered surfaces;
- procedural texture synthesis, masks, wear, wetness, dirt and damage state;
- automatic UV/mapping strategy appropriate to generated topology;
- mesh cleanup, normals/tangents, welding, simplification and LOD generation;
- compile-time validation and runtime-ready baking;
- persistent compiled-asset cache and progressive generation policy.

### Exit gate
Generated assets must survive close inspection in the Lab without exposing the construction method, while runtime retains only the data required for rendering/simulation unless explicitly dynamic.

---

## Phase 3 — Character Production

### Goal
Build a contact-aware procedural character stack that can reach modern third-person/first-person production quality without coupling gameplay intent to authored animation clips.

### Work
- stable skeleton/pose/skinning runtime;
- intent and trajectory prediction;
- contact-phase locomotion and persistent foot/hand contacts;
- balance, body alignment, slope/stair adaptation and constraints;
- full-body IK and interaction posing;
- weapon/tool rigs, recoil and layered physical response;
- gaze/head/upper-body attention systems;
- animation LOD and budgeted update cadence;
- hooks for motion matching, learned pose search or recorded data as optional pose sources;
- deterministic interaction between animation, physics and world surface state.

### Exit gate
Characters must move through uneven generated environments with stable contacts, believable whole-body response and bounded update cost, while gameplay supplies intent rather than bone transforms.

---

## Phase 4 — World Production

### Goal
Turn shared world fields, sectors and streaming contracts into a coherent large-world runtime where systems react to the same state.

### Work
- sector generation/streaming with deterministic persistence;
- HLOD and projected-importance-driven representation selection;
- hydrology/water state and surface interaction;
- atmosphere, wind, moisture, temperature/light/ecology fields;
- field-driven vegetation, materials, VFX and audio coupling;
- interior/exterior visibility and sector/portal policies where useful;
- world history/deltas and resumable generation;
- destruction/change persistence contracts without game-specific semantics;
- background compilation and bounded streaming queues.

### Exit gate
Streaming, visuals, surfaces, effects, audio and procedural content must consume coherent shared state and remain deterministic from seed plus persisted deltas.

---

## Phase 5 — Runtime Optimization & Production Hardening

### Goal
Make high fidelity predictable rather than accidental.

### Work
- frame-budget ownership per subsystem/pass;
- GPU/CPU telemetry and regression thresholds;
- HLOD, animation LOD, effect LOD and update-cadence control;
- projected screen importance instead of distance-only quality decisions;
- job throttling, cancellation, backpressure and cache pressure handling;
- transient and persistent memory budgets;
- dynamic resolution and quality governor tied to measured costs;
- graceful degradation ladders instead of catastrophic stalls;
- long-run soak tests, deterministic replay/snapshot checks and resource-leak tests;
- representative Lab benchmark scenarios for renderer, world, characters and procedural compilation.

### Exit gate
Representative validation scenes must remain inside explicit CPU/GPU/memory budgets and degrade quality predictably before frame pacing becomes unstable.

---

## Cross-cutting production rules

1. **WebGL2 is a first-class backend.** No subsystem may assume WebGPU.
2. **Procedural is a content architecture, not a visual style.** The player should not be able to tell how an asset was generated.
3. **Compile, then bake.** Construction data is temporary unless runtime mutation genuinely requires it.
4. **One world, shared state.** Wind, moisture, water, surfaces, ecology, effects, audio and materials should consume common fields rather than invent disconnected local truths.
5. **Determinism is preserved.** Seed + inputs + persisted deltas must reproduce state where the contract promises it.
6. **Projected importance drives detail.** Screen relevance beats naive Euclidean-distance-only policies.
7. **Budgets are API constraints.** CPU, GPU, memory and background work are measured and bounded.
8. **The Lab proves public APIs.** It may not hide engine defects with private demo-only paths.
9. **Benchmarks are references, not dependencies.** No proprietary code/assets or game-specific concepts belong in RAVEN.
10. **Foundation regression blocks integration.** Every future milestone must keep audit -> typecheck -> tests -> build green on Node 20 and Node 22.

---

## Milestone order

`FOUNDATION (FROZEN) -> Production Renderer -> Procedural Production -> Character Production -> World Production -> Runtime Optimization / Production Hardening`

Subsystems may develop in parallel when their contracts are stable, but milestone exit gates are cumulative: later work is not allowed to weaken earlier verified guarantees.
