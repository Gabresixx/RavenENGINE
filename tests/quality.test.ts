import { describe,expect,it } from 'vitest';
import { BudgetWatchdog, QualityGovernor } from '../packages/quality/src/index';

describe('quality controls',()=>{
 it('detects overloaded draw-call budget',()=>{const w=new BudgetWatchdog({maxDrawCalls:100,maxTriangles:1000,maxDynamicLights:10,maxParticles:100,maxShadowCasters:10});expect(w.inspect({drawCalls:120,triangles:1,dynamicLights:1,particles:1,shadowCasters:1}).max).toBeGreaterThan(1);});
 it('reduces render scale under sustained overload samples',()=>{const q=new QualityGovernor();for(let i=0;i<10;i++)q.update(25,2);expect(q.state.renderScale).toBeLessThan(1);});
});
