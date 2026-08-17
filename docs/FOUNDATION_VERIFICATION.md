# Foundation verification contract

RAVEN's foundation is considered verified only when the complete CI matrix passes these gates in order:

1. `pnpm verify:foundation` — architecture/package/determinism/platform invariants.
2. `pnpm typecheck` — TypeScript project-reference integrity across the monorepo.
3. `pnpm test` — subsystem and foundation behavioral invariants.
4. `pnpm build` — production build of the executable RAVEN Lab integration path.

The matrix covers Node 20 and Node 22. Foundation completion is a contract, not a claim that rendering, physics, animation, tooling or procedural content features are themselves feature-complete.

Future feature work may extend the engine, but it must preserve the platform boundary, deterministic content path, explicit resource ownership, versioned persistence, bounded concurrency, capability-based backend model and domain-neutral 3D engine core.
