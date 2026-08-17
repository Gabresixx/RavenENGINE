export type Sdf=(x:number,y:number,z:number)=>number;
export const sphere=(cx:number,cy:number,cz:number,r:number):Sdf=>(x,y,z)=>Math.hypot(x-cx,y-cy,z-cz)-r;
export const smoothUnion=(a:Sdf,b:Sdf,k:number):Sdf=>(x,y,z)=>{const da=a(x,y,z),db=b(x,y,z);const h=Math.max(k-Math.abs(da-db),0)/k;return Math.min(da,db)-h*h*k*0.25;};

export interface SdfBounds { min:[number,number,number]; max:[number,number,number]; resolution:number; }
export interface SdfVolume { bounds:SdfBounds; values:Float32Array; }

export function sampleSdf(sdf:Sdf,bounds:SdfBounds):SdfVolume{
  const n=bounds.resolution; const values=new Float32Array(n*n*n);let i=0;
  for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const fx=bounds.min[0]+(bounds.max[0]-bounds.min[0])*(x/(n-1));
    const fy=bounds.min[1]+(bounds.max[1]-bounds.min[1])*(y/(n-1));
    const fz=bounds.min[2]+(bounds.max[2]-bounds.min[2])*(z/(n-1)); values[i++]=sdf(fx,fy,fz);
  }
  return{bounds,values};
}
