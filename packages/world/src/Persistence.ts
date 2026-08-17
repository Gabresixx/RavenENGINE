export interface WorldDelta { id:string; sector:string; type:'surface'|'destroyed'|'moved'|'collected'|'custom'; payload:unknown; }
export class WorldDeltaStore {
  private bySector=new Map<string,WorldDelta[]>();
  append(delta:WorldDelta):void{const list=this.bySector.get(delta.sector)??[];list.push(delta);this.bySector.set(delta.sector,list);}
  forSector(sector:string):readonly WorldDelta[]{return this.bySector.get(sector)??[];}
  serialize():string{return JSON.stringify([...this.bySector.entries()]);}
  restore(json:string):void{this.bySector=new Map(JSON.parse(json) as [string,WorldDelta[]][]);}
}
