# ADR 0001 — WebGL2 is the baseline renderer

Status: Accepted

RAVEN targets WebGL2 as its mandatory graphics API. WebGPU is intentionally out of scope for the first architecture because driver stability and broad predictable behavior are higher priority than access to newer features.

The renderer must therefore be designed around capabilities available in WebGL2 and explicit extension probing.
