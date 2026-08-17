export type Bottleneck='cpu'|'gpu-or-render'|'balanced';
export class FrameGovernor {
  classify(frameMs:number,simulationMs:number,targetMs=16.6667):Bottleneck{
    if(frameMs<targetMs*0.92)return'balanced';
    if(simulationMs>targetMs*0.48)return'cpu';
    return'gpu-or-render';
  }
}
