export interface FrameTelemetry {
  frameMs: number;
  cpuSimulationMs: number;
  drawCalls: number;
  triangles: number;
  visibleObjects: number;
  activeLights: number;
  activeParticles: number;
  generationQueue: number;
  renderScale: number;
}

export class Telemetry {
  readonly current: FrameTelemetry = {
    frameMs: 0,
    cpuSimulationMs: 0,
    drawCalls: 0,
    triangles: 0,
    visibleObjects: 0,
    activeLights: 0,
    activeParticles: 0,
    generationQueue: 0,
    renderScale: 1
  };

  resetTransient(): void {
    this.current.drawCalls = 0;
    this.current.triangles = 0;
    this.current.visibleObjects = 0;
    this.current.activeLights = 0;
    this.current.activeParticles = 0;
  }
}
