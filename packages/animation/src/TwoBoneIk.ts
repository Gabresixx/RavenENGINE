export interface TwoBoneIkInput { root:[number,number,number]; mid:[number,number,number]; tip:[number,number,number]; target:[number,number,number]; pole:[number,number,number]; }
export interface TwoBoneIkResult { mid:[number,number,number]; tip:[number,number,number]; reached:boolean; }
const len=(a:number[])=>Math.hypot(a[0],a[1],a[2]);
export function solveTwoBoneIk(i:TwoBoneIkInput):TwoBoneIkResult{
  const upper=len([i.mid[0]-i.root[0],i.mid[1]-i.root[1],i.mid[2]-i.root[2]]);const lower=len([i.tip[0]-i.mid[0],i.tip[1]-i.mid[1],i.tip[2]-i.mid[2]]);
  const tx=i.target[0]-i.root[0],ty=i.target[1]-i.root[1],tz=i.target[2]-i.root[2];const d=Math.max(1e-5,Math.hypot(tx,ty,tz));const reach=Math.min(d,upper+lower-1e-5);const dir:[number,number,number]=[tx/d,ty/d,tz/d];
  const along=(upper*upper-lower*lower+reach*reach)/(2*reach);const height=Math.sqrt(Math.max(0,upper*upper-along*along));
  const px=i.pole[0]-i.root[0],py=i.pole[1]-i.root[1],pz=i.pole[2]-i.root[2];const dot=px*dir[0]+py*dir[1]+pz*dir[2];let ox=px-dir[0]*dot,oy=py-dir[1]*dot,oz=pz-dir[2]*dot;const ol=Math.max(1e-5,Math.hypot(ox,oy,oz));ox/=ol;oy/=ol;oz/=ol;
  return{mid:[i.root[0]+dir[0]*along+ox*height,i.root[1]+dir[1]*along+oy*height,i.root[2]+dir[2]*along+oz*height],tip:[i.root[0]+dir[0]*reach,i.root[1]+dir[1]*reach,i.root[2]+dir[2]*reach],reached:d<=upper+lower};
}
