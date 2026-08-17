import { MeshBuilder } from './MeshBuilder';
import type { MeshBuffers } from './types';
import type { SdfVolume } from './ImplicitSurface';

type P=[number,number,number];
const tetrahedra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]] as const;
const corners:[[number,number,number],[number,number,number],[number,number,number],[number,number,number],[number,number,number],[number,number,number],[number,number,number],[number,number,number]]=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];

export function polygonizeSdf(volume:SdfVolume,iso=0):MeshBuffers{
  const {bounds,values}=volume,n=bounds.resolution,b=new MeshBuilder();
  const idx=(x:number,y:number,z:number)=>z*n*n+y*n+x;
  const world=(x:number,y:number,z:number):P=>[bounds.min[0]+(bounds.max[0]-bounds.min[0])*(x/(n-1)),bounds.min[1]+(bounds.max[1]-bounds.min[1])*(y/(n-1)),bounds.min[2]+(bounds.max[2]-bounds.min[2])*(z/(n-1))];
  const interp=(a:P,bp:P,va:number,vb:number):P=>{const t=Math.abs(vb-va)<1e-8?0.5:(iso-va)/(vb-va);return[a[0]+(bp[0]-a[0])*t,a[1]+(bp[1]-a[1])*t,a[2]+(bp[2]-a[2])*t];};
  const normal=(p:P):P=>{const e=(bounds.max[0]-bounds.min[0])/(n-1)*0.5;const sample=(q:P)=>sampleTrilinear(volume,q);let gx=sample([p[0]+e,p[1],p[2]])-sample([p[0]-e,p[1],p[2]]),gy=sample([p[0],p[1]+e,p[2]])-sample([p[0],p[1]-e,p[2]]),gz=sample([p[0],p[1],p[2]+e])-sample([p[0],p[1],p[2]-e]);const l=Math.max(1e-8,Math.hypot(gx,gy,gz));return[gx/l,gy/l,gz/l];};
  const emit=(p0:P,p1:P,p2:P)=>{const n0=normal(p0),n1=normal(p1),n2=normal(p2);const a=b.vertex(...p0,...n0),c=b.vertex(...p1,...n1),d=b.vertex(...p2,...n2);b.triangle(a,c,d);};
  for(let z=0;z<n-1;z++)for(let y=0;y<n-1;y++)for(let x=0;x<n-1;x++){
    const ps=corners.map(c=>world(x+c[0],y+c[1],z+c[2]));const vs=corners.map(c=>values[idx(x+c[0],y+c[1],z+c[2])]);
    for(const t of tetrahedra){const ids=[...t];const inside=ids.filter(i=>vs[i]<iso),outside=ids.filter(i=>vs[i]>=iso);if(inside.length===0||inside.length===4)continue;
      if(inside.length===1||inside.length===3){const inv=inside.length===3;const one=(inv?outside:inside)[0],others=inv?inside:outside;const tri=others.map(o=>interp(ps[one],ps[o],vs[one],vs[o])) as [P,P,P];emit(inv?tri[0]:tri[0],inv?tri[2]:tri[1],inv?tri[1]:tri[2]);}
      else {const [a,c]=inside,[d,e]=outside;const p0=interp(ps[a],ps[d],vs[a],vs[d]),p1=interp(ps[a],ps[e],vs[a],vs[e]),p2=interp(ps[c],ps[d],vs[c],vs[d]),p3=interp(ps[c],ps[e],vs[c],vs[e]);emit(p0,p1,p2);emit(p2,p1,p3);}
    }
  }
  return b.build();
}

function sampleTrilinear(v:SdfVolume,p:P):number{const {bounds,values}=v,n=bounds.resolution;const fx=(p[0]-bounds.min[0])/(bounds.max[0]-bounds.min[0])*(n-1),fy=(p[1]-bounds.min[1])/(bounds.max[1]-bounds.min[1])*(n-1),fz=(p[2]-bounds.min[2])/(bounds.max[2]-bounds.min[2])*(n-1);const x0=Math.max(0,Math.min(n-1,Math.floor(fx))),y0=Math.max(0,Math.min(n-1,Math.floor(fy))),z0=Math.max(0,Math.min(n-1,Math.floor(fz))),x1=Math.min(n-1,x0+1),y1=Math.min(n-1,y0+1),z1=Math.min(n-1,z0+1),tx=Math.max(0,Math.min(1,fx-x0)),ty=Math.max(0,Math.min(1,fy-y0)),tz=Math.max(0,Math.min(1,fz-z0));const at=(x:number,y:number,z:number)=>values[z*n*n+y*n+x];const a=at(x0,y0,z0)*(1-tx)+at(x1,y0,z0)*tx,b=at(x0,y1,z0)*(1-tx)+at(x1,y1,z0)*tx,c=at(x0,y0,z1)*(1-tx)+at(x1,y0,z1)*tx,d=at(x0,y1,z1)*(1-tx)+at(x1,y1,z1)*tx;return(a*(1-ty)+b*ty)*(1-tz)+(c*(1-ty)+d*ty)*tz;}
