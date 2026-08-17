export interface ContactShadowSettings{maxDistance:number;steps:number;thickness:number;strength:number;}
export const defaultContactShadow:ContactShadowSettings={maxDistance:.7,steps:8,thickness:.035,strength:.7};
export function scaleContactShadow(s:ContactShadowSettings,importance:number,pressure:number):ContactShadowSettings{return{maxDistance:s.maxDistance,steps:Math.max(3,Math.round(s.steps*Math.max(.4,importance*2)*(1-pressure*.55))),thickness:s.thickness,strength:s.strength};}
