export interface ProductionQualityState{
  pressure:number;
  aoScale:number;
  reflectionScale:number;
  volumetricScale:number;
  contactShadowScale:number;
  reflectionSteps:number;
  volumetricSteps:number;
  contactShadowSteps:number;
  ssrEnabled:boolean;
  volumetricsEnabled:boolean;
}
const clamp01=(v:number)=>Math.max(0,Math.min(1,v));
export function resolveProductionQuality(pressure:number):ProductionQualityState{
  const p=clamp01(pressure);
  const reflectionScale=Math.max(.35,1-p*.72);
  const volumetricScale=Math.max(.4,1-p*.62);
  const aoScale=Math.max(.5,1-p*.42);
  const contactShadowScale=Math.max(.7,1-p*.22);
  return{
    pressure:p,
    aoScale,
    reflectionScale,
    volumetricScale,
    contactShadowScale,
    reflectionSteps:Math.max(8,Math.round(32*(1-p*.7))),
    volumetricSteps:Math.max(12,Math.round(48*(1-p*.62))),
    contactShadowSteps:Math.max(5,Math.round(10*(1-p*.38))),
    ssrEnabled:p<.88,
    volumetricsEnabled:p<.95
  };
}
