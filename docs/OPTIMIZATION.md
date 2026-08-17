# Optimization model

RAVEN optimizes by **importance and budget**, not by blanket low quality.

## Budget hierarchy
1. Protect frame pacing.
2. Protect player, held weapon and immediate interaction targets.
3. Protect silhouettes and contact shadows.
4. Degrade reflections/volumetrics before core geometry.
5. Reduce distant animation and world simulation before nearby behavior.

## GPU safety
The runtime tracks hard ceilings for draw calls, visible triangles, dynamic lights, particles and shadow casters. Crossing a ceiling triggers degradation rather than attempting an unbounded frame.

## CPU safety
Scheduler cadence, projected importance, job queues and animation LOD prevent every object from updating every frame.

## Generation safety
Procedural compilation is chunkable. Construction data is discarded after baking and cached assets are memory-budgeted.
