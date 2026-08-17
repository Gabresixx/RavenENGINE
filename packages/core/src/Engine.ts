import { Clock } from './Clock';
import { Scheduler } from './Scheduler';
import { Telemetry } from './Telemetry';

export interface EngineSystem {
  start?(): void;
  stop?(): void;
}

export class RavenEngine {
  readonly clock = new Clock();
  readonly scheduler = new Scheduler();
  readonly telemetry = new Telemetry();
  private systems: EngineSystem[] = [];
  private running = false;
  private raf = 0;

  use<T extends EngineSystem>(system: T): T {
    this.systems.push(system);
    if (this.running) system.start?.();
    return system;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    for (const system of this.systems) system.start?.();
    const loop = (now: number) => {
      if (!this.running) return;
      const frame = this.clock.tick(now);
      const frameStart = performance.now();
      this.telemetry.resetTransient();
      this.telemetry.current.cpuSimulationMs = this.scheduler.run(frame, 4);
      this.telemetry.current.frameMs = performance.now() - frameStart;
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
    for (const system of [...this.systems].reverse()) system.stop?.();
  }
}
