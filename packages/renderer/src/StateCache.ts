export class GlStateCache{
  private program:WebGLProgram|null=null;private vao:WebGLVertexArrayObject|null=null;private depth=true;private blend=false;private cull=true;
  constructor(readonly gl:WebGL2RenderingContext){}
  useProgram(program:WebGLProgram|null):void{if(this.program===program)return;this.program=program;this.gl.useProgram(program);}
  bindVertexArray(vao:WebGLVertexArrayObject|null):void{if(this.vao===vao)return;this.vao=vao;this.gl.bindVertexArray(vao);}
  setDepth(enabled:boolean):void{if(this.depth===enabled)return;this.depth=enabled;enabled?this.gl.enable(this.gl.DEPTH_TEST):this.gl.disable(this.gl.DEPTH_TEST);}
  setCull(enabled:boolean):void{if(this.cull===enabled)return;this.cull=enabled;enabled?this.gl.enable(this.gl.CULL_FACE):this.gl.disable(this.gl.CULL_FACE);}
  setBlend(enabled:boolean):void{if(this.blend===enabled)return;this.blend=enabled;enabled?this.gl.enable(this.gl.BLEND):this.gl.disable(this.gl.BLEND);}
  invalidate():void{this.program=null;this.vao=null;}
}
