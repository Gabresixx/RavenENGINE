# Scene pipeline

RAVEN owns its math, transforms and GPU mesh upload path. No Three.js scene graph is required.

`procedural compiler -> CpuMeshLike -> GpuMesh -> ECS Renderable + Transform -> scene extraction -> PBR draw packets -> renderer`

Transforms are hierarchical but stored as components. Rendering consumes extracted immutable-ish frame packets rather than walking gameplay objects during draw submission.
