# RAVEN Runtime Engine

**RAVEN** is an experimental, WebGL2-first procedural runtime engine built to make procedural generation produce **authored-looking final assets**, not visible construction primitives.

RAVEN is an engine project, not a game. The `apps/lab` target is only a technical smoke environment for validating engine subsystems.

## Core laws

1. **Procedural compile, then bake.** Rich temporary construction data is discarded after runtime-ready meshes, LODs, collision proxies and material descriptions are produced.
2. **Nothing expensive if it does not matter on screen.** Projected importance and hero budgets drive geometry, animation, reflection, shadow and simulation quality.
3. **One coherent world.** Materials, contacts, water, ecology, atmosphere, VFX and animation consume shared environmental/surface state.
4. **Frame pacing beats fixed quality.** Hard safety ceilings and degradation policies exist from day one.
5. **WebGL2 is the baseline.** RAVEN deliberately has no WebGPU dependency in its v0 architecture.

## Packages

- `@raven/math` — vectors, quaternions, matrices, transforms.
- `@raven/core` — engine loop, fixed stepping, ECS, scheduler, jobs/workers, input, events, telemetry.
- `@raven/renderer` — WebGL2 device/resources, GPU meshes, frame graph, PBR foundation, temporal/screen-space infrastructure.
- `@raven/assets` — mesh/SDF/hard-surface/terrain/vegetation compilers, LOD and caches.
- `@raven/materials` — procedural material graphs, layering and mutable surface-state atlas.
- `@raven/world` — sectors, streaming, HLOD, world history, ecology, wind, water and shared fields.
- `@raven/animation` — skeleton/pose, procedural motion, contact/IK, gaze, face, weapon mechanics and deformation hooks.
- `@raven/physics` — spatial broadphase, contact queries and inexpensive secondary dynamics.
- `@raven/vfx` — shared surface interactions, particles, decals and ripples.
- `@raven/audio` — WebAudio runtime and material-aware sound profiles.
- `@raven/quality` — adaptive quality, watchdog ceilings, degradation and hero budgets.
- `@raven/engine` — public lifecycle/scene facade tying the runtime together.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm dev
```

Active foundation work lives on `foundation/raven-v0` until the architecture is ready for review into `main`.

See `docs/ARCHITECTURE.md`, `docs/END_TO_END_RUNTIME.md`, `docs/OPTIMIZATION.md`, and `docs/REFERENCES.md`.
