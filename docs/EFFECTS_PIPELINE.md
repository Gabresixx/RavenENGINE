# Effects and surface interaction

RAVEN does not let footsteps, bullets, rain, water and particles independently guess what a surface is.

A physical/contact query emits a `SurfaceInteraction`. The interaction table resolves material-specific response tags. Audio, particles, decals, wet transfer and friction response then consume the same event.

Screen-space rendering follows the same rule: AO, SSR and volumetrics consume shared depth/history resources declared through the frame graph. Expensive effects expose scale/step-count degradation axes.
