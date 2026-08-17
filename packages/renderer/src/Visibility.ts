export interface BoundingSphere { x:number;y:number;z:number;radius:number; }
export interface FrustumPlane { x:number;y:number;z:number;w:number; }
export function sphereInFrustum(s:BoundingSphere,planes:readonly FrustumPlane[]):boolean{
  for(const p of planes) if(p.x*s.x+p.y*s.y+p.z*s.z+p.w < -s.radius) return false;
  return true;
}
export interface VisibilityCandidate<T>{value:T;bounds:BoundingSphere;importance:number;occlusionHint?:number;}
export function selectVisible<T>(items:readonly VisibilityCandidate<T>[],planes:readonly FrustumPlane[],minImportance:number):T[]{
  return items.filter(i=>i.importance>=minImportance&&(i.occlusionHint??0)<0.98&&sphereInFrustum(i.bounds,planes)).sort((a,b)=>b.importance-a.importance).map(i=>i.value);
}
