# Runtime world model

RAVEN's world is data-first. Entity/component storage contains dynamic identity; spatial hash/contact world answer local physical queries; world fields answer continuous environmental queries; sectors own streaming/persistence; history simulation produces causal degradation inputs before asset compilation.

The renderer consumes extracted packets. It does not own gameplay entities.

Secondary motion uses inexpensive constrained Verlet systems for straps, cables, hair guides and cloth edges. Heavy rigid-body simulation is intentionally not a prerequisite for visual grounding.
