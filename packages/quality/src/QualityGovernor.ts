export interface QualityState {
  renderScale: number;
  shadowScale: number;
  volumetricScale: number;
  reflectionScale: number;
  particleScale: number;
  geometryBudget: number;
  animationBudget: number;
}

export class QualityGovernor {
  readonly state: QualityState = {
    renderScale: 1,
    shadowScale: 1,
    volumetricScale: 0.5,
    reflectionScale: 0.5,
    particleScale: 1,
    geometryBudget: 1,
    animationBudget: 1
  };

  constructor(readonly targetFrameMs = 16.6667) {}

  update(frameMs: number, cpuSimulationMs: number): QualityState {
    const overload = frameMs / this.targetFrameMs;
    if (overload > 1.08) {
      this.state.reflectionScale = Math.max(0.25, this.state.reflectionScale - 0.05);
      this.state.volumetricScale = Math.max(0.25, this.state.volumetricScale - 0.05);
      this.state.shadowScale = Math.max(0.5, this.state.shadowScale - 0.05);
      this.state.renderScale = Math.max(0.67, this.state.renderScale - 0.02);
    } else if (overload < 0.78) {
      this.state.renderScale = Math.min(1, this.state.renderScale + 0.01);
      this.state.shadowScale = Math.min(1, this.state.shadowScale + 0.02);
      this.state.volumetricScale = Math.min(1, this.state.volumetricScale + 0.02);
      this.state.reflectionScale = Math.min(1, this.state.reflectionScale + 0.02);
    }
    if (cpuSimulationMs > this.targetFrameMs * 0.45) {
      this.state.animationBudget = Math.max(0.4, this.state.animationBudget - 0.05);
    } else {
      this.state.animationBudget = Math.min(1, this.state.animationBudget + 0.01);
    }
    return this.state;
  }
}
