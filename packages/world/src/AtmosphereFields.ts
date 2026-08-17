export interface AtmosphereSample { wind:[number,number,number]; humidity:number; fogDensity:number; rain:number; skyVisibility:number; }

export class AtmosphereFields {
  time=0;
  baseWind:[number,number,number]=[1.2,0,0.4];
  humidity=0.72;
  rain=0;
  update(dt:number):void{this.time+=dt;}
  sample(x:number,y:number,z:number):AtmosphereSample{
    const gust=Math.sin(this.time*0.37+x*0.021+z*0.017)*0.35;
    return{wind:[this.baseWind[0]*(1+gust),this.baseWind[1],this.baseWind[2]*(1+gust*0.5)],humidity:this.humidity,fogDensity:Math.max(0,0.008+(this.humidity-0.5)*0.018-y*0.0008),rain:this.rain,skyVisibility:1};
  }
}
