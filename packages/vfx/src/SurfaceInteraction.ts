export type InteractionKind='footstep'|'bullet'|'body'|'rain'|'wheel'|'melee';
export interface SurfaceInteraction{kind:InteractionKind;position:[number,number,number];normal:[number,number,number];materialId:number;energy:number;wetness:number;velocity:[number,number,number];}
export interface SurfaceResponse{soundTag:string;particleTag:string;decalTag?:string;frictionImpulse:number;wetTransfer:number;}
export class SurfaceInteractionTable{private responses=new Map<string,SurfaceResponse>();set(materialId:number,kind:InteractionKind,response:SurfaceResponse):this{this.responses.set(`${materialId}:${kind}`,response);return this;}resolve(i:SurfaceInteraction):SurfaceResponse|undefined{return this.responses.get(`${i.materialId}:${i.kind}`);}}
