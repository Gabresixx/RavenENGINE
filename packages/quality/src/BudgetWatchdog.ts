export interface RuntimeBudgets { maxDrawCalls:number; maxTriangles:number; maxDynamicLights:number; maxParticles:number; maxShadowCasters:number; }
export interface RuntimeCounts { drawCalls:number; triangles:number; dynamicLights:number; particles:number; shadowCasters:number; }
export interface BudgetPressure { drawCalls:number; triangles:number; dynamicLights:number; particles:number; shadowCasters:number; max:number; }

const pressure=(value:number,limit:number)=>limit<=0?1:value/limit;

export class BudgetWatchdog {
  constructor(readonly budgets:RuntimeBudgets={maxDrawCalls:1800,maxTriangles:2_500_000,maxDynamicLights:64,maxParticles:40_000,maxShadowCasters:64}){}
  inspect(c:RuntimeCounts):BudgetPressure{
    const p={drawCalls:pressure(c.drawCalls,this.budgets.maxDrawCalls),triangles:pressure(c.triangles,this.budgets.maxTriangles),dynamicLights:pressure(c.dynamicLights,this.budgets.maxDynamicLights),particles:pressure(c.particles,this.budgets.maxParticles),shadowCasters:pressure(c.shadowCasters,this.budgets.maxShadowCasters),max:0};
    p.max=Math.max(p.drawCalls,p.triangles,p.dynamicLights,p.particles,p.shadowCasters); return p;
  }
}
