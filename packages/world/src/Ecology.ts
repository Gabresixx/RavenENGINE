export interface EcologySite { moisture:number;soil:number;light:number;vertical:number;disturbance:number; }
export interface SpeciesRule { id:string;moisture:[number,number];soil:[number,number];light:[number,number];verticalAffinity:number;disturbanceTolerance:number; }
export function speciesSuitability(site:EcologySite,s:SpeciesRule):number{
  const range=(v:number,r:[number,number])=>v<r[0]||v>r[1]?0:1-Math.abs(v-(r[0]+r[1])*0.5)/Math.max(0.001,(r[1]-r[0])*0.5);
  return range(site.moisture,s.moisture)*range(site.soil,s.soil)*range(site.light,s.light)*(1-Math.abs(site.vertical-s.verticalAffinity))*Math.max(0,1-site.disturbance*(1-s.disturbanceTolerance));
}
