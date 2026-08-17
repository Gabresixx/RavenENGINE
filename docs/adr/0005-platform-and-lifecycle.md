# ADR 0005 — Platform and lifecycle boundaries

RAVEN core must not directly own browser globals for frame scheduling, storage or worker creation. These capabilities are injected through `@raven/platform`.

Engine modules declare dependencies and are started in topological order, stopped/disposed in reverse order. Duplicate modules, missing dependencies and dependency cycles are hard errors.

Resource ownership is explicit through scopes/handles; stale generational handles must fail instead of silently aliasing reused resources.
