# ADR 0008 — 3D procedural AAA scope, benchmark-driven generalization

RAVEN deliberately targets high-fidelity 3D. Supporting 2D/general app use is not an architectural goal.

RAVEN is procedural-first: conventional mesh imports may be supported for interoperability but cannot become the primary content architecture.

Public techniques and observable engineering from RAGE/Rockstar, Naughty Dog and other high-end engines are valid references. The engine remains benchmark-driven rather than game-driven: game names, locations, factions and title-specific mechanics are forbidden inside engine packages and are checked automatically.
