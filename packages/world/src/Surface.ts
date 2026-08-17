export interface MaterialTraits {
  hardness:number;
  porosity:number;
  absorbency:number;
  friction:number;
  dirtRetention:number;
  mossAffinity:number;
  metallic:number;
}

export interface SurfaceState {
  wetness:number;
  mud:number;
  blood:number;
  dust:number;
  burn:number;
  damage:number;
}

export function evolveSurface(state:SurfaceState, traits:MaterialTraits, rain:number, dt:number):void{
  state.wetness=Math.min(1,state.wetness+rain*traits.absorbency*dt);
  if(rain<=0) state.wetness=Math.max(0,state.wetness-dt*(0.015+0.08*(1-traits.absorbency)));
  state.dust=Math.max(0,state.dust-rain*0.5*dt);
}
