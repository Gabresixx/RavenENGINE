export type HeroClass='player'|'held-weapon'|'interaction'|'near-enemy'|'cinematic'|'ordinary';
const weights:Record<HeroClass,number>={player:4,'held-weapon':5,interaction:2.5,'near-enemy':2.2,cinematic:6,ordinary:1};
export interface HeroBudgetInput{heroClass:HeroClass;projectedImportance:number;distance:number;}
export interface HeroBudgetDecision{weight:number;geometryMultiplier:number;animationMultiplier:number;shadowPriority:number;materialDetail:number;}
export function heroBudget(i:HeroBudgetInput):HeroBudgetDecision{const w=weights[i.heroClass],p=Math.min(1,i.projectedImportance*w);return{weight:w,geometryMultiplier:.45+p*1.55,animationMultiplier:.35+p*1.65,shadowPriority:p,materialDetail:.3+p*.7};}
