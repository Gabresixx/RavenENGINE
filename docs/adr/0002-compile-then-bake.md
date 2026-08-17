# ADR 0002 — Procedural systems compile, then bake

Status: Accepted

Procedural construction data is transient. Asset generators may use expensive intermediate topology, SDF samples, profile curves, temporary meshes and material graphs, but runtime receives consolidated buffers, LODs, collision proxies and material descriptors.

This prevents procedural authorship from leaking into runtime cost and visual language.
