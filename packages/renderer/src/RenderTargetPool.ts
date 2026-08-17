export interface RenderTargetDesc { width:number;height:number;internalFormat:number;format:number;type:number;filter:number; }
export interface PooledTarget { texture:WebGLTexture; framebuffer:WebGLFramebuffer; desc:RenderTargetDesc; inUse:boolean; lastFrame:number; }

export class RenderTargetPool {
  private targets:PooledTarget[]=[];
  constructor(readonly gl:WebGL2RenderingContext){}
  acquire(desc:RenderTargetDesc,frame:number):PooledTarget{
    const hit=this.targets.find(t=>!t.inUse&&same(t.desc,desc));if(hit){hit.inUse=true;hit.lastFrame=frame;return hit;}
    const texture=this.gl.createTexture(),framebuffer=this.gl.createFramebuffer();if(!texture||!framebuffer)throw new Error('Failed to allocate render target');
    this.gl.bindTexture(this.gl.TEXTURE_2D,texture);this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,desc.filter);this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,desc.filter);this.gl.texImage2D(this.gl.TEXTURE_2D,0,desc.internalFormat,desc.width,desc.height,0,desc.format,desc.type,null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,framebuffer);this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,texture,0);this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
    const target={texture,framebuffer,desc:{...desc},inUse:true,lastFrame:frame};this.targets.push(target);return target;
  }
  endFrame(frame:number,maxIdleFrames=120):void{for(const t of this.targets)t.inUse=false;this.targets=this.targets.filter(t=>{if(frame-t.lastFrame<=maxIdleFrames)return true;this.gl.deleteTexture(t.texture);this.gl.deleteFramebuffer(t.framebuffer);return false;});}
  dispose():void{for(const t of this.targets){this.gl.deleteTexture(t.texture);this.gl.deleteFramebuffer(t.framebuffer);}this.targets=[];}
}
const same=(a:RenderTargetDesc,b:RenderTargetDesc)=>a.width===b.width&&a.height===b.height&&a.internalFormat===b.internalFormat&&a.format===b.format&&a.type===b.type&&a.filter===b.filter;
