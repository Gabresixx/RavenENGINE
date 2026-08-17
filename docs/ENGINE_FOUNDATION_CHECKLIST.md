# RAVEN Foundation — 100% definition

Foundation means the contracts underneath rendering/content features are closed enough that later AAA work does not require redesigning the engine core.

## Platform and lifecycle
- [x] Browser/platform globals isolated behind `@raven/platform`
- [x] Injected frame clock/scheduling, storage and worker creation
- [x] Formal created/starting/running/stopping/stopped/disposing/disposed/faulted lifecycle
- [x] Dependency-ordered module graph with cycle/missing-dependency failure
- [x] Service container and fault boundary

## Ownership and memory
- [x] Generational handles with stale-handle rejection
- [x] Explicit disposable resource scopes
- [x] Byte arenas, object pools and bounded ring/queue primitives
- [x] Budgeted reference-counted resource manager and eviction

## Concurrency
- [x] Platform worker factory; no worker construction inside core
- [x] Extensible request protocol
- [x] Cancellation propagation to worker requests
- [x] Bounded queues/backpressure
- [x] Dependency task graph and priority/deadline job scheduler

## Persistence and determinism
- [x] Engine/snapshot ABI constants
- [x] Versioned binary writer/reader and codec contracts
- [x] Snapshot envelope with schema/version/length/checksum
- [x] Storage-independent snapshot store
- [x] Deterministic ECS entity/component ordering
- [x] Unknown component payloads are skippable
- [x] Engine configuration is validated and platform-derived explicitly

## Backend and package boundaries
- [x] Capability-driven backend registry
- [x] Low-level package dependency direction is machine-verified
- [x] Browser/time globals forbidden in core by automated audit
- [x] `Math.random()` forbidden in engine packages
- [x] Game-specific benchmark vocabulary forbidden in engine packages
- [x] Procedural-first, 3D high-fidelity identity documented

## Verification
- [x] Foundation invariant test suite
- [x] Architecture verification script
- [x] CI runs architecture audit, typecheck, tests and production build
- [x] CI verifies Node 20 and Node 22
- [x] Workspace package aliases are explicit in tests
- [x] Foundation gate has passed end-to-end on both CI matrix targets

## Already existing systems the foundation supports
- [x] WebGL2 device/capabilities, render graph, target pooling and GPU timing
- [x] Deterministic clock/RNG/scheduler/telemetry
- [x] ECS scene extraction and unified engine facade
- [x] Asset compile-then-bake/cache/SDF/mesh/LOD primitives
- [x] Layered material/surface contracts
- [x] World fields/streaming/HLOD/persistence contracts
- [x] Skeleton/motion/IK/contact contracts
- [x] Physics/VFX/audio/quality subsystem contracts

## Explicitly NOT foundation

Cascaded shadows, SSR, volumetrics, skin/cloth quality, advanced procedural generators, destruction fidelity, final physics, AI, editor UX and benchmark visuals are **feature/subsystem milestones built on the foundation**. They may be incomplete without making the foundation incomplete.

# Foundation status: **100% VERIFIED / FROZEN**

This branch is the frozen Foundation baseline. Frozen means the verified contracts above are no longer open-ended implementation work: feature milestones must build on them instead of casually redesigning them. A foundation contract may change only through an explicit architectural change with an ADR, migration/compatibility plan where required, updated tests, and the complete Node 20/22 foundation gate green again.

The foundation gate is mandatory for every future change. A later commit that breaks architecture audit, TypeScript integrity, tests or production build is not eligible for integration until the gate is green again.
