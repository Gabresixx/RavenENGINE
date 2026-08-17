import{makeSectorRecipe,type SectorRecipe}from'./SectorGenerator';import{sectorKey,type SectorCoord,type SectorRecord}from'./Sector';import{StreamingManager}from'./StreamingManager';
export interface SectorLifecycle{load(recipe:SectorRecipe,quality:'proxy'|'resident',signal:AbortSignal):Promise<void>;unload(coord:SectorCoord):void;}
export class StreamCoordinator{
  private inflight=new Map<string,AbortController>();
  constructor(readonly manager:StreamingManager,readonly lifecycle:SectorLifecycle,readonly worldSeed:number){}
  ensure(coord:SectorCoord,importance:number,frame:number):SectorRecord{const key=sectorKey(coord.x,coord.z);let s=this.manager.sectors.get(key);if(!s){const seed=makeSectorRecipe(coord,this.worldSeed).seed;s={key,coord,state:'unloaded',seed,lastVisibleFrame:frame,projectedImportance:importance};this.manager.sectors.set(key,s);}s.projectedImportance=importance;if(importance>0)s.lastVisibleFrame=frame;return s;}
  async synchronize(frame:number):Promise<void>{this.manager.update(frame);for(const s of this.manager.sectors.values()){const active=this.inflight.get(s.key);if(s.state==='unloaded'){active?.abort();this.inflight.delete(s.key);this.lifecycle.unload(s.coord);continue;}if(active)continue;if(s.state==='proxy'||s.state==='resident'){const controller=new AbortController();this.inflight.set(s.key,controller);const recipe=makeSectorRecipe(s.coord,this.worldSeed);try{await this.lifecycle.load(recipe,s.state,controller.signal)}finally{if(this.inflight.get(s.key)===controller)this.inflight.delete(s.key);}}}}
}
