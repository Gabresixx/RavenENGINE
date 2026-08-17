import{describe,expect,it}from'vitest';
import{DynamicResolutionController,FrameGraph,PassBudgetController,resolveProductionQuality}from'../packages/renderer/src/index';

describe('production renderer policy invariants',()=>{
  it('orders frame graph dependencies and computes resource lifetimes',()=>{
    const graph=new FrameGraph().declare({name:'depth',kind:'texture',transient:true}).declare({name:'color',kind:'texture',transient:true}).declare({name:'backbuffer',kind:'external',transient:false});
    graph.add({name:'present',reads:['color'],writes:['backbuffer'],execute:()=>{}}).add({name:'shade',reads:['depth'],writes:['color'],execute:()=>{}}).add({name:'depth',reads:[],writes:['depth'],execute:()=>{}});
    const plan=graph.compilePlan();expect(plan.passes.map(p=>p.name)).toEqual(['depth','shade','present']);expect(plan.lifetimes.get('depth')?.producer).toBe('depth');expect(plan.lifetimes.get('depth')?.lastUse).toBe(1);expect(plan.lifetimes.get('color')?.lastUse).toBe(2);
  });
  it('rejects undeclared frame graph resources',()=>{const graph=new FrameGraph();expect(()=>graph.add({name:'bad',reads:['missing'],writes:[],execute:()=>{}})).toThrow(/undeclared resource/);});
  it('smooths dynamic resolution pressure instead of oscillating every frame',()=>{const d=new DynamicResolutionController(16.6667,.67,1,.2,2);for(let i=0;i<12;i++)d.update(28,25);expect(d.scale).toBeLessThan(1);const low=d.scale;for(let i=0;i<30;i++)d.update(8,7);expect(d.scale).toBeGreaterThan(low);expect(d.scale).toBeLessThanOrEqual(1);});
  it('degrades pass-local quality when a measured GPU budget is exceeded',()=>{const b=new PassBudgetController(1).register({name:'ssr',scale:1,maxMs:2,enabled:true,minScale:.35,degradationRate:.1});b.observe('ssr',4);expect(b.passes.get('ssr')?.scale).toBe(.9);expect(b.pressure()).toBe(2);});
  it('sheds reflections and volumetrics before protected contact detail',()=>{const q=resolveProductionQuality(.8);expect(q.reflectionScale).toBeLessThan(q.contactShadowScale);expect(q.volumetricScale).toBeLessThan(q.contactShadowScale);expect(q.contactShadowSteps).toBeGreaterThanOrEqual(5);});
});
