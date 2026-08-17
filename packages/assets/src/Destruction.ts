export interface DestructibleMaterial{fracture:'glass'|'wood'|'concrete'|'metal';toughness:number;thickness:number;grain?:[number,number,number];}
export interface DamageEvent{position:[number,number,number];direction:[number,number,number];energy:number;radius:number;}
export interface DamageRepresentation{mode:'shader'|'decal'|'fracture';severity:number;seed:number;}
export function chooseDamageRepresentation(material:DestructibleMaterial,event:DamageEvent,importance:number,seed:number):DamageRepresentation{const severity=Math.min(1,event.energy/Math.max(.001,material.toughness*material.thickness));const mode=importance<.015?'shader':importance<.08?'decal':severity>.32?'fracture':'decal';return{mode,severity,seed};}
