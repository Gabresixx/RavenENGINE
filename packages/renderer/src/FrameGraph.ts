export interface FrameGraphResource{name:string;kind:'texture'|'buffer'|'external';transient:boolean;}
export interface FrameGraphPass{name:string;reads:readonly string[];writes:readonly string[];enabled?:()=>boolean;execute:(ctx:FrameGraphExecution)=>void;}
export interface FrameGraphExecution{gl:WebGL2RenderingContext;resources:ReadonlyMap<string,unknown>;width:number;height:number;frame:number;}
export interface FrameGraphResourceLifetime{resource:FrameGraphResource;firstUse:number;lastUse:number;producer?:string;consumers:readonly string[];}
export interface FrameGraphPlan{passes:readonly FrameGraphPass[];lifetimes:ReadonlyMap<string,FrameGraphResourceLifetime>;}
export interface FrameGraphExecutionHooks{firstUse?:(lifetime:FrameGraphResourceLifetime,ctx:FrameGraphExecution)=>void;lastUse?:(lifetime:FrameGraphResourceLifetime,ctx:FrameGraphExecution)=>void;}

export class FrameGraph{
  private resources=new Map<string,FrameGraphResource>();
  private passes:FrameGraphPass[]=[];
  private cached?:FrameGraphPlan;

  declare(r:FrameGraphResource):this{
    if(this.resources.has(r.name))throw new Error(`FrameGraph resource already declared: ${r.name}`);
    this.resources.set(r.name,{...r});this.cached=undefined;return this;
  }
  add(pass:FrameGraphPass):this{
    if(this.passes.some(p=>p.name===pass.name))throw new Error(`FrameGraph pass already declared: ${pass.name}`);
    for(const name of [...pass.reads,...pass.writes])if(!this.resources.has(name))throw new Error(`FrameGraph pass ${pass.name} references undeclared resource: ${name}`);
    this.passes.push(pass);this.cached=undefined;return this;
  }
  compile():readonly FrameGraphPass[]{return this.compilePlan().passes;}
  compilePlan():FrameGraphPlan{
    if(this.cached)return this.cached;
    const produced=new Set<string>();
    const remaining=[...this.passes],out:FrameGraphPass[]=[];
    for(const r of this.resources.values())if(r.kind==='external')produced.add(r.name);
    while(remaining.length){
      const i=remaining.findIndex(p=>p.reads.every(r=>produced.has(r)));
      if(i<0)throw new Error(`FrameGraph dependency cycle or missing producer: ${remaining.map(p=>p.name).join(', ')}`);
      const p=remaining.splice(i,1)[0];out.push(p);for(const w of p.writes)produced.add(w);
    }
    const lifetimeMutable=new Map<string,{resource:FrameGraphResource;firstUse:number;lastUse:number;producer?:string;consumers:string[]}>();
    for(const r of this.resources.values())lifetimeMutable.set(r.name,{resource:r,firstUse:Number.POSITIVE_INFINITY,lastUse:-1,consumers:[]});
    out.forEach((p,index)=>{
      for(const name of p.reads){const l=lifetimeMutable.get(name)!;l.firstUse=Math.min(l.firstUse,index);l.lastUse=Math.max(l.lastUse,index);l.consumers.push(p.name);}
      for(const name of p.writes){const l=lifetimeMutable.get(name)!;l.firstUse=Math.min(l.firstUse,index);l.lastUse=Math.max(l.lastUse,index);l.producer??=p.name;}
    });
    const lifetimes=new Map<string,FrameGraphResourceLifetime>();
    for(const [name,l] of lifetimeMutable){const first=Number.isFinite(l.firstUse)?l.firstUse:0;lifetimes.set(name,{resource:l.resource,firstUse:first,lastUse:Math.max(first,l.lastUse),producer:l.producer,consumers:Object.freeze([...l.consumers])});}
    this.cached={passes:Object.freeze([...out]),lifetimes};return this.cached;
  }
  execute(base:FrameGraphExecution,hooks:FrameGraphExecutionHooks={}):void{
    const plan=this.compilePlan();
    for(let index=0;index<plan.passes.length;index++){
      for(const lifetime of plan.lifetimes.values())if(lifetime.firstUse===index)hooks.firstUse?.(lifetime,base);
      const p=plan.passes[index];if(!p.enabled||p.enabled())p.execute(base);
      for(const lifetime of plan.lifetimes.values())if(lifetime.lastUse===index)hooks.lastUse?.(lifetime,base);
    }
  }
}
