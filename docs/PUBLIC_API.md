# Public API direction

Consumers instantiate one `Raven` facade. Subsystems remain individually importable for tools and tests, but a game should not manually wire renderer, streaming, quality, atmosphere and diagnostics on every project.

```ts
const raven = new Raven({ canvas, targetFps: 60 });
raven.start();
```

The facade owns lifecycle, while data-oriented subsystem APIs remain explicit and testable.
