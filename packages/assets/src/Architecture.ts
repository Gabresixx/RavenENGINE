export interface FacadeBay { width:number; kind:'wall'|'window'|'door'|'storefront'|'service'; floors?:number[]; }
export interface BuildingProgram { footprint:[number,number][]; floorHeight:number; floors:number; bays:readonly FacadeBay[]; roof:'flat'|'parapet'|'mechanical'; damageSeed:number; }

export function validateBuildingProgram(p:BuildingProgram):void{
  if(p.footprint.length<3) throw new Error('Building footprint requires at least three points');
  if(p.floors<1||p.floorHeight<=0) throw new Error('Building dimensions must be positive');
  if(!p.bays.length) throw new Error('Building requires facade bays');
}
