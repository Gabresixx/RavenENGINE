export interface FroxelGrid{width:number;height:number;depth:number;density:Float32Array;lighting:Float32Array;}
export function createFroxelGrid(width:number,height:number,depth=32):FroxelGrid{return{width,height,depth,density:new Float32Array(width*height*depth),lighting:new Float32Array(width*height*depth*3)};}
export function clearFroxelGrid(g:FroxelGrid):void{g.density.fill(0);g.lighting.fill(0);}
