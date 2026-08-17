export interface PassBudget { name:string; scale:number; maxMs:number; enabled:boolean; minScale?:number; recoveryRate?:number; degradationRate?:number; }
export interface PassBudgetState extends PassBudget{lastMs?:number;smoothedMs?:number;pressure:number;}
export class PassBudgetController {
  readonly passes=new Map<string,PassBudgetState>();
  constructor(readonly smoothing=.2){}
  register(b:PassBudget):this{if(b.maxMs<=0)throw new RangeError(`Pass budget must be positive: ${b.name}`);this.passes.set(b.name,{...b,pressure:0});return this;}
  observe(name:string,ms:number):PassBudgetState|undefined{
    const p=this.passes.get(name);if(!p||!Number.isFinite(ms)||ms<0)return p;
    p.lastMs=ms;p.smoothedMs=p.smoothedMs===undefined?ms:p.smoothedMs+(ms-p.smoothedMs)*this.smoothing;p.pressure=p.smoothedMs/p.maxMs;
    if(p.pressure>1.05)this.degrade(name,p.degradationRate??.08,p.minScale??.25);
    else if(p.pressure<.72)this.recover(name,p.recoveryRate??.02);
    return p;
  }
  observeAll(samples:Readonly<Record<string,number>>):void{for(const [name,ms]of Object.entries(samples))this.observe(name,ms);}
  degrade(name:string,amount=.1,min=.25):void{const p=this.passes.get(name);if(p)p.scale=Math.max(p.minScale??min,p.scale-amount);}
  recover(name:string,amount=.025):void{const p=this.passes.get(name);if(p)p.scale=Math.min(1,p.scale+amount);}
  pressure():number{let max=0;for(const p of this.passes.values())if(p.enabled)max=Math.max(max,p.pressure);return max;}
  snapshot():Readonly<Record<string,PassBudgetState>>{return Object.freeze(Object.fromEntries([...this.passes].map(([k,v])=>[k,{...v}])));}
}
