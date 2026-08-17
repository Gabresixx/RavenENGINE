# Subsystem contracts

## Asset compilation
A generator may be arbitrarily rich internally, but outputs only baked runtime buffers, LODs, collision proxies and material slots. The runtime never depends on temporary construction topology.

## World fields
Gameplay, rendering and procedural generation query shared spatial state. Height, normal, moisture, water, wind, occlusion and material identity are treated as data products rather than ad-hoc local guesses.

## Animation
Animation consumes intent + predicted contacts and writes a pose. Gameplay does not directly rotate render meshes. Constraints are ordered and composable.

## Quality
Every expensive subsystem exposes at least one degradation axis. No subsystem owns the right to exceed the global frame budget.

## Streaming
Objects are promoted based on projected importance. Hero and interaction weights may override distance, but must still participate in memory and frame budgets.
