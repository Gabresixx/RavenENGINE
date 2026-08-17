# ADR 0006 — Versioned binary serialization

Persistent RAVEN state uses a versioned binary envelope with engine ABI, schema id, schema version, payload length and checksum. Runtime snapshots must be deterministic: entity and component ordering is stable before encoding.

Codecs own backwards decoding/migration semantics. Unknown ECS component stores are length-delimited and may be skipped, allowing optional modules to be absent without corrupting the snapshot stream.

Platform storage is injected; serialization does not assume IndexedDB directly.
