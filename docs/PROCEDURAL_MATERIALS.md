# Procedural material synthesis

RAVEN allocates geometric detail by frequency.

- **Macro** silhouette/topology belongs to geometry.
- **Meso** wear, panel breakup, shallow deformation and stains belong primarily to material/height data.
- **Micro** pores, weave, fibers and scratches belong to normals/roughness and filtered texture detail.

The CPU texture synthesizer is deterministic and worker-friendly. It can generate base color, normal, ORM and height fields from compact seeded recipes. Runtime mapping utilities provide stochastic tile offsets and triplanar projection so generated topology does not require handcrafted UVs to avoid obvious repetition.

Texture synthesis is cached separately from geometry because multiple assets may share the same material recipe while keeping unique world-state overlays such as wetness, mud and damage.
