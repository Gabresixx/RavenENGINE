# World fields

RAVEN world generation is causal rather than independent random scattering.

A sector may compile a low-resolution spatial field set from terrain and history:

`height -> slope/curvature -> drainage/flow/basins -> moisture -> disturbance -> ecological suitability`

The same fields are queryable at runtime through `WorldFieldProvider`. Water, vegetation placement, material wetness, contact VFX and future structural degradation can therefore derive from one spatial truth.

Weighted Poisson sampling places instances according to suitability while preserving spatial separation. This is intentionally different from calling `randomPosition()` for every plant or prop.

Field resolution is decoupled from render resolution and is designed to run in worker jobs, making causal generation inexpensive enough for streamed sectors.
