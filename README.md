# RAVEN Runtime Engine

**RAVEN** is an experimental procedural AAA-oriented runtime engine targeting **WebGL2**.

The engine is being designed around a strict set of principles:

1. Procedural systems fabricate authored-looking assets; they must not expose procedural-looking construction.
2. Detail is allocated by projected importance, not by naive object count or distance alone.
3. Rendering, materials, world simulation, contacts, atmosphere, animation and ecology share coherent world-state fields.
4. Runtime stability wins over fixed quality. The engine degrades expensive systems before missing its frame-time budget.
5. No WebGPU dependency. RAVEN targets WebGL2 first and treats GPU-driver stability as a hard design constraint.

Development happens on milestone branches before integration into `main`.
