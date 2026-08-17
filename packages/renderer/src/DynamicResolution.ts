export class DynamicResolutionController {
  scale = 1;
  constructor(
    readonly targetFrameMs = 16.6667,
    readonly minScale = 0.67,
    readonly maxScale = 1
  ) {}

  update(frameMs: number): number {
    const high = this.targetFrameMs * 1.08;
    const low = this.targetFrameMs * 0.82;
    if (frameMs > high) this.scale = Math.max(this.minScale, this.scale - 0.025);
    else if (frameMs < low) this.scale = Math.min(this.maxScale, this.scale + 0.01);
    return this.scale;
  }
}
