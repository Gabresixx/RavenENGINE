export interface FrameTiming {
  frame: number;
  nowMs: number;
  realDeltaMs: number;
  simulationDeltaMs: number;
  elapsedMs: number;
}

export class Clock {
  private lastMs = 0;
  private elapsedMs = 0;
  private frame = 0;

  tick(nowMs: number): FrameTiming {
    const realDeltaMs = this.frame === 0 ? 16.6667 : Math.max(0, nowMs - this.lastMs);
    const simulationDeltaMs = Math.min(realDeltaMs, 50);
    this.lastMs = nowMs;
    this.elapsedMs += simulationDeltaMs;
    return { frame: this.frame++, nowMs, realDeltaMs, simulationDeltaMs, elapsedMs: this.elapsedMs };
  }
}
