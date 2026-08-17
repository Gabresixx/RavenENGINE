export interface DynamicResolutionSample{cpuFrameMs:number;gpuFrameMs?:number;}
export class DynamicResolutionController {
  scale = 1;
  smoothedFrameMs:number|undefined;
  private cooldown=0;
  constructor(
    readonly targetFrameMs = 16.6667,
    readonly minScale = 0.67,
    readonly maxScale = 1,
    readonly smoothing = .12,
    readonly cooldownFrames = 4
  ) {
    if(targetFrameMs<=0)throw new RangeError('targetFrameMs must be positive');
    if(minScale<=0||minScale>maxScale)throw new RangeError('invalid dynamic resolution range');
  }
  update(frameMs:number,gpuMs?:number):number{
    return this.observe({cpuFrameMs:frameMs,gpuFrameMs:gpuMs});
  }
  observe(sample:DynamicResolutionSample):number{
    const measured=Math.max(sample.cpuFrameMs,sample.gpuFrameMs??0);
    if(!Number.isFinite(measured)||measured<=0)return this.scale;
    this.smoothedFrameMs=this.smoothedFrameMs===undefined?measured:this.smoothedFrameMs+(measured-this.smoothedFrameMs)*this.smoothing;
    if(this.cooldown>0){this.cooldown--;return this.scale;}
    const pressure=this.smoothedFrameMs/this.targetFrameMs;
    if(pressure>1.04){const step=pressure>1.3?.05:.025;this.scale=Math.max(this.minScale,this.scale-step);this.cooldown=this.cooldownFrames;}
    else if(pressure<.82){this.scale=Math.min(this.maxScale,this.scale+.01);this.cooldown=this.cooldownFrames;}
    return this.scale;
  }
  reset(scale=1):void{this.scale=Math.max(this.minScale,Math.min(this.maxScale,scale));this.smoothedFrameMs=undefined;this.cooldown=0;}
}
