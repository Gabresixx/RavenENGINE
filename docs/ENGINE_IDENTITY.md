# RAVEN identity

RAVEN is a **3D high-fidelity, procedural-first engine**. Its target class is modern high-end/AAA 3D rendering and simulation. It is not intended to become a universal 2D/game-app framework.

## Procedural-first

The native content path is recipe/fields -> geometry/material/rig/state -> compiled runtime asset -> LOD/HLOD/cache. Conventional imported meshes may exist later as interoperability, but they are not the architectural center of RAVEN.

## Benchmark-driven, not game-driven

RAGE/Rockstar technology, Naughty Dog technology and other public AAA rendering/animation/world-system references are benchmarks and engineering inspiration. No individual game may leak domain concepts into the engine core. Game-specific behavior belongs in recipes, modules or projects above the engine boundary.

## Performance

High fidelity is pursued under explicit CPU/GPU/memory budgets. Stability and predictable frame time are foundation requirements, not optional optimization passes.
