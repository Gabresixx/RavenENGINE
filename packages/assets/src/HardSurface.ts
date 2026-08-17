import { MeshBuilder } from './MeshBuilder';
import type { MeshBuffers } from './types';

export interface ProfilePoint { x:number; y:number; }
export interface LoftSection { z:number; scaleX:number; scaleY:number; offsetX?:number; offsetY?:number; }

export function loftProfile(profile:readonly ProfilePoint[],sections:readonly LoftSection[]):MeshBuffers{
  if(profile.length<3||sections.length<2) throw new Error('loftProfile requires >=3 profile points and >=2 sections');
  const b=new MeshBuilder(); const rings:number[][]=[];
  for(const s of sections){const ring:number[]=[];for(const p of profile){ring.push(b.vertex(p.x*s.scaleX+(s.offsetX??0),p.y*s.scaleY+(s.offsetY??0),s.z,0,0,1));}rings.push(ring);}
  for(let r=0;r<rings.length-1;r++){for(let i=0;i<profile.length;i++){const n=(i+1)%profile.length;b.quad(rings[r][i],rings[r][n],rings[r+1][n],rings[r+1][i]);}}
  return b.build();
}
