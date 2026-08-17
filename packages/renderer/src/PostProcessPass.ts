import{FullscreenPass}from'./FullscreenPass';import{ravenToneMapGlsl}from'./ToneMapping';
const fs=`#version 300 es
precision highp float;
in vec2 vUv;out vec4 outColor;
uniform sampler2D uColor;uniform sampler2D uBloom;uniform sampler2D uExposure;uniform bool uHasBloom;uniform bool uAutoExposure;uniform float uManualExposure;uniform float uBloomIntensity;
${ravenToneMapGlsl}
void main(){vec3 c=texture(uColor,vUv).rgb;if(uHasBloom)c+=texture(uBloom,vUv).rgb*uBloomIntensity;float exposure=uAutoExposure?texelFetch(uExposure,ivec2(0),0).r:uManualExposure;outColor=vec4(ravenGrade(c,exposure),1.0);}`;
export class PostProcessPass extends FullscreenPass{
 constructor(gl:WebGL2RenderingContext){super(gl,fs);}
 render(color:WebGLTexture,bloom:WebGLTexture|undefined,exposureTexture:WebGLTexture|undefined,width:number,height:number,manualExposure=0,bloomIntensity=0):void{const g=this.gl;g.bindFramebuffer(g.FRAMEBUFFER,null);g.viewport(0,0,width,height);g.disable(g.DEPTH_TEST);this.program.use();g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,color);g.uniform1i(this.program.uniform('uColor'),0);g.activeTexture(g.TEXTURE1);g.bindTexture(g.TEXTURE_2D,bloom??color);g.uniform1i(this.program.uniform('uBloom'),1);g.activeTexture(g.TEXTURE2);g.bindTexture(g.TEXTURE_2D,exposureTexture??color);g.uniform1i(this.program.uniform('uExposure'),2);g.uniform1i(this.program.uniform('uHasBloom'),bloom?1:0);g.uniform1i(this.program.uniform('uAutoExposure'),exposureTexture?1:0);g.uniform1f(this.program.uniform('uManualExposure'),manualExposure);g.uniform1f(this.program.uniform('uBloomIntensity'),bloomIntensity);this.draw();g.enable(g.DEPTH_TEST);}
}
