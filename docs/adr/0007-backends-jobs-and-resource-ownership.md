# ADR 0007 — Backends, jobs and resource ownership

Engine subsystems consume capability-based backends rather than concrete browser/global implementations. Backends are registered by kind and must explicitly advertise capabilities.

Long-running work is cancellable. Worker requests are extensible string-keyed messages and cancellation is part of the protocol. Job queues are bounded: backpressure is preferred over unbounded memory growth.

Runtime resources use generational handles and explicit reference counts/budgets. Stale handles fail; zero-reference resources may be evicted under budget pressure.
