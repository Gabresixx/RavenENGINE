export interface SurfaceTexel { wetness:number; mud:number; blood:number; dust:number; burn:number; damage:number; }

export class SurfaceStateAtlas {
  readonly data:Float32Array;
  constructor(readonly width:number,readonly height:number){this.data=new Float32Array(width*height*4);}
  write(x:number,y:number,wetness:number,mud:number,damage:number,blood:number):void{
    const i=(y*this.width+x)*4;this.data[i]=wetness;this.data[i+1]=mud;this.data[i+2]=damage;this.data[i+3]=blood;
  }
  decay(dt:number):void{for(let i=0;i<this.data.length;i+=4){this.data[i]=Math.max(0,this.data[i]-dt*0.002);this.data[i+1]=Math.max(0,this.data[i+1]-dt*0.0002);}}
}
