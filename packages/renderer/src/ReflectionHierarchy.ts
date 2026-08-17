export type ReflectionMode='none'|'sky'|'probe'|'ssr'|'planar';
export interface ReflectionInput{roughness:number;importance:number;planarCandidate:boolean;ssrAvailable:boolean;probeAvailable:boolean;pressure:number;}
export function chooseReflection(i:ReflectionInput):ReflectionMode{if(i.roughness>.92||i.importance<.003)return'none';if(i.planarCandidate&&i.importance>.2&&i.pressure<.35)return'planar';if(i.ssrAvailable&&i.roughness<.65&&i.importance>.025&&i.pressure<.8)return'ssr';if(i.probeAvailable)return'probe';return'sky';}
