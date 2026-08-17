interface PendingQuery{name:string;query:WebGLQuery;}
export class GpuTimer {
  private ext:any;
  private active:PendingQuery|null=null;
  private pending:PendingQuery[]=[];
  private latest:Record<string,number>={};
  lastMs:number|undefined;
  constructor(readonly gl:WebGL2RenderingContext){this.ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');}
  get supported():boolean{return !!this.ext;}
  begin(name='frame'):void{if(!this.ext||this.active)return;const query=this.gl.createQuery();if(!query)return;this.active={name,query};this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT,query);}
  end():void{if(!this.ext||!this.active)return;this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);this.pending.push(this.active);this.active=null;}
  poll():number|undefined{this.pollResults();return this.lastMs;}
  pollResults():Readonly<Record<string,number>>{
    if(!this.ext)return this.latest;
    const disjoint=!!this.gl.getParameter(this.ext.GPU_DISJOINT_EXT);
    while(this.pending.length){const item=this.pending[0];const available=!!this.gl.getQueryParameter(item.query,this.gl.QUERY_RESULT_AVAILABLE);if(!available)break;this.pending.shift();if(!disjoint){const ms=this.gl.getQueryParameter(item.query,this.gl.QUERY_RESULT)/1e6;this.latest[item.name]=ms;if(item.name==='frame')this.lastMs=ms;}this.gl.deleteQuery(item.query);}
    if(disjoint){for(const item of this.pending)this.gl.deleteQuery(item.query);this.pending=[];this.latest={};this.lastMs=undefined;}
    return this.latest;
  }
  dispose():void{if(this.active){this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);this.gl.deleteQuery(this.active.query);this.active=null;}for(const item of this.pending)this.gl.deleteQuery(item.query);this.pending=[];this.latest={};}
}
