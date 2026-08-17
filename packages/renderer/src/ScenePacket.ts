export interface DrawPacket {
  vao: WebGLVertexArrayObject;
  indexCount: number;
  indexType: number;
  materialId: number;
  projectedImportance: number;
  castsShadow: boolean;
}

export interface LightPacket { position:[number,number,number]; color:[number,number,number]; intensity:number; range:number; castsShadow:boolean; }

export interface ScenePacket { opaque:DrawPacket[]; transparent:DrawPacket[]; lights:LightPacket[]; }

export function sortScenePacket(packet:ScenePacket):void{
  packet.opaque.sort((a,b)=>b.projectedImportance-a.projectedImportance || a.materialId-b.materialId);
  packet.transparent.sort((a,b)=>a.projectedImportance-b.projectedImportance);
}
