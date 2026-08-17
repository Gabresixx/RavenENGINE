# End-to-end runtime path

RAVEN now owns a complete basic execution path without Three.js:

`Input/AI -> fixed simulation -> ECS components -> transform hierarchy -> scene extraction -> PBR draw packets -> GPU mesh/VAO -> WebGL2 draw -> frame/gpu telemetry -> quality policy`

World streaming runs independently through deterministic sector recipes and lifecycle callbacks. Contact queries use a spatial-hash broadphase before exact shape tests. Worker hosts can compile sectors/assets/textures away from the main thread.

This is intentionally a minimal production spine: advanced passes layer on top without changing how gameplay data reaches the renderer.
