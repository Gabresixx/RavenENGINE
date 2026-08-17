import type { MeshBuffers } from './types';

export function simplifyByVertexClustering(mesh:MeshBuffers,cellSize:number):MeshBuffers{
  if(cellSize<=0)return mesh;const map=new Map<string,number>(),pos:number[]=[],norm:number[]=[],uv:number[]=[],counts:number[]=[];const remap=new Uint32Array(mesh.positions.length/3);
  for(let i=0;i<remap.length;i++){const x=mesh.positions[i*3],y=mesh.positions[i*3+1],z=mesh.positions[i*3+2],key=`${Math.round(x/cellSize)},${Math.round(y/cellSize)},${Math.round(z/cellSize)}`;let j=map.get(key);if(j===undefined){j=pos.length/3;map.set(key,j);pos.push(0,0,0);norm.push(0,0,0);uv.push(0,0);counts.push(0);}counts[j]++;pos[j*3]+=x;pos[j*3+1]+=y;pos[j*3+2]+=z;norm[j*3]+=mesh.normals[i*3];norm[j*3+1]+=mesh.normals[i*3+1];norm[j*3+2]+=mesh.normals[i*3+2];if(mesh.uvs){uv[j*2]+=mesh.uvs[i*2];uv[j*2+1]+=mesh.uvs[i*2+1];}remap[i]=j;}
  for(let j=0;j<counts.length;j++){const c=counts[j];pos[j*3]/=c;pos[j*3+1]/=c;pos[j*3+2]/=c;const l=Math.max(1e-8,Math.hypot(norm[j*3],norm[j*3+1],norm[j*3+2]));norm[j*3]/=l;norm[j*3+1]/=l;norm[j*3+2]/=l;uv[j*2]/=c;uv[j*2+1]/=c;}
  const inds:number[]=[];for(let i=0;i<mesh.indices.length;i+=3){const a=remap[mesh.indices[i]],b=remap[mesh.indices[i+1]],c=remap[mesh.indices[i+2]];if(a!==b&&b!==c&&a!==c)inds.push(a,b,c);}const Index=pos.length/3>65535?Uint32Array:Uint16Array;
  return{positions:new Float32Array(pos),normals:new Float32Array(norm),uvs:mesh.uvs?new Float32Array(uv):undefined,indices:new Index(inds)};
}
