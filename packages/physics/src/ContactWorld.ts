export interface Ray{origin:[number,number,number];dir:[number,number,number];maxDistance:number;}
export interface ContactHit{id:number;distance:number;point:[number,number,number];normal:[number,number,number];materialId:number;}
export interface ContactShape{id:number;raycast(ray:Ray):ContactHit|undefined;}
export class ContactWorld{private shapes=new Map<number,ContactShape>();add(shape:ContactShape):void{this.shapes.set(shape.id,shape);}remove(id:number):void{this.shapes.delete(id);}raycast(ray:Ray):ContactHit|undefined{let best:ContactHit|undefined;for(const s of this.shapes.values()){const h=s.raycast(ray);if(h&&h.distance<=ray.maxDistance&&(!best||h.distance<best.distance))best=h;}return best;}}
