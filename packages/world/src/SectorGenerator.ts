import type { SectorCoord } from './Sector';
export interface SectorRecipe { coord:SectorCoord;seed:number;terrainSeed:number;architectureSeed:number;ecologySeed:number;historySeed:number; }
const hash=(x:number,z:number,seed:number)=>{let h=(seed^Math.imul(x,374761393)^Math.imul(z,668265263))>>>0;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0;};
export function makeSectorRecipe(coord:SectorCoord,worldSeed:number):SectorRecipe{
  const seed=hash(coord.x,coord.z,worldSeed);return{coord,seed,terrainSeed:hash(coord.x,coord.z,seed^0x11),architectureSeed:hash(coord.x,coord.z,seed^0x22),ecologySeed:hash(coord.x,coord.z,seed^0x33),historySeed:hash(coord.x,coord.z,seed^0x44)};
}
