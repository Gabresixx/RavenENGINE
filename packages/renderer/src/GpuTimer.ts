export class GpuTimer {
  private ext:any;
  private active:WebGLQuery|null=null;
  private pending:WebGLQuery[]=[];
  lastMs:number|undefined;
  constructor(readonly gl:WebGL2RenderingContext){this.ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');}
  begin():void{if(!this.ext||this.active)return;const q=this.gl.createQuery();if(!q)return;this.active=q;this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT,q);}
  end():void{if(!this.ext||!this.active)return;this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);this.pending.push(this.active);this.active=null;}
  poll():number|undefined{if(!this.ext||!this.pending.length)return this.lastMs;const q=this.pending[0];const available=this.gl.getQueryParameter(q,this.gl.QUERY_RESULT_AVAILABLE);const disjoint=this.gl.getParameter(this.ext.GPU_DISJOINT_EXT);if(available){this.pending.shift();if(!disjoint)this.lastMs=this.gl.getQueryParameter(q,this.gl.QUERY_RESULT)/1e6;this.gl.deleteQuery(q);}return this.lastMs;}
}
