# Render pipeline

The production spine is now an offscreen WebGL2 pipeline:

1. Depth prepass into a reusable depth texture.
2. Opaque PBR color using the same depth attachment.
3. Reduced-resolution screen-space ambient occlusion reading shared depth.
4. Tonemap/composite to the default framebuffer.

Cascaded shadow texture-array resources, temporal history, reflection policy, tiled-light lists, depth-pyramid and volumetric/froxel infrastructure are separate modules so they can enter the frame graph without changing scene extraction.

Every expensive screen-space effect has an independent quality dimension. RAVEN should lower pass resolution/sample count before destabilizing frame pacing.
