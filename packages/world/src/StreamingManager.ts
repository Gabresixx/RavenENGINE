import type { SectorRecord } from './Sector';

export interface StreamingPolicy { residentThreshold:number; proxyThreshold:number; coolFrames:number; }

export class StreamingManager {
  readonly sectors=new Map<string,SectorRecord>();
  constructor(readonly policy:StreamingPolicy={residentThreshold:0.08,proxyThreshold:0.005,coolFrames:180}){}

  update(frame:number):void{
    for(const s of this.sectors.values()){
      const i=s.projectedImportance;
      if(i>=this.policy.residentThreshold) s.state='resident';
      else if(i>=this.policy.proxyThreshold) s.state='proxy';
      else if(frame-s.lastVisibleFrame>this.policy.coolFrames) s.state='unloaded';
      else if(s.state!=='unloaded') s.state='cooling';
    }
  }
}
