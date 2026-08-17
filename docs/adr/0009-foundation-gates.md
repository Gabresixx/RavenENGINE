# ADR 0009 — Foundation gates

RAVEN foundation completion is a machine-enforced property, not a subjective milestone. CI must verify package direction, deterministic RNG policy, browser-global isolation, domain-neutral engine code, TypeScript project integrity, unit/invariant tests and production build.

Visual/rendering feature completeness is intentionally excluded from the foundation gate. New feature work may begin only after the foundation gate is green; any later change that breaks it blocks integration.
