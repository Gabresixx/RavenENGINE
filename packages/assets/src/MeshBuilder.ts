import type { MeshBuffers } from './types';

export class MeshBuilder {
  private positions: number[] = [];
  private normals: number[] = [];
  private uvs: number[] = [];
  private indices: number[] = [];

  vertex(px:number,py:number,pz:number,nx:number,ny:number,nz:number,u=0,v=0): number {
    const i = this.positions.length / 3;
    this.positions.push(px,py,pz); this.normals.push(nx,ny,nz); this.uvs.push(u,v);
    return i;
  }

  triangle(a:number,b:number,c:number): this { this.indices.push(a,b,c); return this; }

  quad(a:number,b:number,c:number,d:number): this { this.indices.push(a,b,c,a,c,d); return this; }

  build(): MeshBuffers {
    const indexArray = this.positions.length / 3 > 65535 ? new Uint32Array(this.indices) : new Uint16Array(this.indices);
    return { positions:new Float32Array(this.positions), normals:new Float32Array(this.normals), uvs:new Float32Array(this.uvs), indices:indexArray };
  }
}
