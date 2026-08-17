import type{RendererCapabilities}from'./Capabilities';
export type SceneColorFormat='rgba16f'|'rgba8';
export class SceneTargets{
  color!:WebGLTexture;depth!:WebGLTexture;framebuffer!:WebGLFramebuffer;width=0;height=0;colorFormat:SceneColorFormat='rgba8';hdr=false;
  constructor(readonly gl:WebGL2RenderingContext,readonly capabilities?:RendererCapabilities){}
  ensure(width:number,height:number):void{
    if(this.width===width&&this.height===height)return;this.dispose();
    if(width<1||height<1)throw new RangeError('Scene target dimensions must be positive');
    const g=this.gl,c=g.createTexture(),d=g.createTexture(),f=g.createFramebuffer();if(!c||!d||!f)throw new Error('Failed to allocate RAVEN scene targets');this.color=c;this.depth=d;this.framebuffer=f;this.width=width;this.height=height;
    const wantsHdr=this.capabilities?.colorBufferFloat??!!g.getExtension('EXT_color_buffer_float');
    this.allocateColor(wantsHdr);this.allocateDepth();g.bindFramebuffer(g.FRAMEBUFFER,f);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,c,0);g.framebufferTexture2D(g.FRAMEBUFFER,g.DEPTH_ATTACHMENT,g.TEXTURE_2D,d,0);
    let status=g.checkFramebufferStatus(g.FRAMEBUFFER);
    if(status!==g.FRAMEBUFFER_COMPLETE&&wantsHdr){this.allocateColor(false);status=g.checkFramebufferStatus(g.FRAMEBUFFER);}
    g.bindFramebuffer(g.FRAMEBUFFER,null);g.bindTexture(g.TEXTURE_2D,null);
    if(status!==g.FRAMEBUFFER_COMPLETE){this.dispose();throw new Error(`Incomplete scene framebuffer: 0x${status.toString(16)}`);}
  }
  private allocateColor(hdr:boolean):void{
    const g=this.gl;g.bindTexture(g.TEXTURE_2D,this.color);const linear=!hdr||(this.capabilities?.floatLinearFiltering??!!g.getExtension('OES_texture_float_linear'));const filter=linear?g.LINEAR:g.NEAREST;g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,filter);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,filter);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
    if(hdr){g.texImage2D(g.TEXTURE_2D,0,g.RGBA16F,this.width,this.height,0,g.RGBA,g.HALF_FLOAT,null);this.colorFormat='rgba16f';this.hdr=true;}
    else{g.texImage2D(g.TEXTURE_2D,0,g.RGBA8,this.width,this.height,0,g.RGBA,g.UNSIGNED_BYTE,null);this.colorFormat='rgba8';this.hdr=false;}
  }
  private allocateDepth():void{const g=this.gl;g.bindTexture(g.TEXTURE_2D,this.depth);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.NEAREST);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.NEAREST);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);g.texImage2D(g.TEXTURE_2D,0,g.DEPTH_COMPONENT24,this.width,this.height,0,g.DEPTH_COMPONENT,g.UNSIGNED_INT,null);}
  dispose():void{if(this.color)this.gl.deleteTexture(this.color);if(this.depth)this.gl.deleteTexture(this.depth);if(this.framebuffer)this.gl.deleteFramebuffer(this.framebuffer);this.color=undefined as unknown as WebGLTexture;this.depth=undefined as unknown as WebGLTexture;this.framebuffer=undefined as unknown as WebGLFramebuffer;this.width=this.height=0;this.colorFormat='rgba8';this.hdr=false;}
}
