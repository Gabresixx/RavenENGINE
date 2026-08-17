import{MeshBuilder}from'./MeshBuilder';import type{MeshBuffers}from'./types';
export interface StemPoint{x:number;y:number;z:number;radius:number;}
export interface VegetationRecipe{stems:readonly StemPoint[][];radialSegments?:number;}
export function compileVegetation(r:VegetationRecipe):MeshBuffers{const b=new MeshBuilder(),seg=r.radialSegments??6;for(const stem of r.stems){const rings:number[][]=[];for(const p of stem){const ring:number[]=[];for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a);ring.push(b.vertex(p.x+c*p.radius,p.y,p.z+s*p.radius,c,0,s,i/seg,p.y));}rings.push(ring);}for(let j=0;j<rings.length-1;j++)for(let i=0;i<seg;i++)b.quad(rings[j][i],rings[j][(i+1)%seg],rings[j+1][(i+1)%seg],rings[j+1][i]);}return b.build();}
