# Foundation checklist

- [x] WebGL2 device and capability probe
- [x] deterministic clock/RNG
- [x] budgeted scheduler and jobs
- [x] diagnostics/telemetry
- [x] quality governor and hard watchdog ceilings
- [x] render graph and dynamic resolution
- [x] GPU resource lifetime primitives and render-target pooling
- [x] GPU timing hook when supported
- [x] projected importance / frustum visibility hooks
- [x] sector streaming / HLOD contracts
- [x] deterministic sector recipes and world deltas
- [x] shared atmosphere/ecology field contracts
- [x] procedural mesh / loft / SDF construction primitives
- [x] SDF polygonization backend
- [x] mesh simplification primitive for LOD baking
- [x] compile-then-bake asset contract and memory cache
- [x] IndexedDB persistent asset cache primitive
- [x] layered material graph, compiler and surface-state atlas
- [x] PBR shader/pass foundation
- [x] skeleton / motion intent / IK / contact contracts
- [x] skinning matrix palette and animation LOD
- [x] worker protocol and pool
- [x] unified engine facade

## Deliberately not claimed complete in v0

RAVEN v0 is the **engine foundation**, not a finished AAA renderer. Production features such as cascaded shadow maps, temporal AO/SSR, volumetric reprojection, virtualized geometry clusters, advanced skin deformation, fracture simulation and authored-quality procedural generators are subsequent engine milestones built on these contracts.
