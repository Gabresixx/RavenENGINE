import { FullscreenPass } from './FullscreenPass';
import type { RendererCapabilities } from './Capabilities';
import type { ResolvedBloomSettings } from './PostProcessing';

interface BloomTarget { texture: WebGLTexture; framebuffer: WebGLFramebuffer; width: number; height: number; }

const extractFs = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uSource;
uniform sampler2D uExposure;
uniform bool uAutoExposure;
uniform float uManualExposure;
uniform float uThreshold;
uniform float uKnee;
uniform vec2 uInvSourceSize;
float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float ev(){return uAutoExposure?texelFetch(uExposure,ivec2(0),0).r:uManualExposure;}
void main(){vec2 o=uInvSourceSize;vec3 c=texture(uSource,vUv+vec2(-o.x,-o.y)).rgb+texture(uSource,vUv+vec2(o.x,-o.y)).rgb+texture(uSource,vUv+vec2(-o.x,o.y)).rgb+texture(uSource,vUv+vec2(o.x,o.y)).rgb;c*=.25;float brightness=luma(c)*exp2(ev());float soft=brightness-uThreshold+uKnee;soft=clamp(soft,0.0,2.0*uKnee);soft=soft*soft/(4.0*uKnee+1e-5);float contribution=max(brightness-uThreshold,soft)/max(brightness,1e-5);outColor=vec4(c*max(contribution,0.0),1);}`;

const downsampleFs = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uSource;
uniform vec2 uInvSourceSize;
void main(){vec2 o=uInvSourceSize*.5;vec3 c=texture(uSource,vUv+vec2(-o.x,-o.y)).rgb+texture(uSource,vUv+vec2(o.x,-o.y)).rgb+texture(uSource,vUv+vec2(-o.x,o.y)).rgb+texture(uSource,vUv+vec2(o.x,o.y)).rgb;outColor=vec4(c*.25,1);}`;

const upsampleFs = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uHigh;
uniform sampler2D uLow;
uniform vec2 uInvLowSize;
uniform float uScatter;
void main(){vec2 o=uInvLowSize;vec3 low=texture(uLow,vUv).rgb*4.0;low+=texture(uLow,vUv+vec2(o.x,0)).rgb*2.0;low+=texture(uLow,vUv-vec2(o.x,0)).rgb*2.0;low+=texture(uLow,vUv+vec2(0,o.y)).rgb*2.0;low+=texture(uLow,vUv-vec2(0,o.y)).rgb*2.0;low+=texture(uLow,vUv+o).rgb+texture(uLow,vUv-o).rgb+texture(uLow,vUv+vec2(o.x,-o.y)).rgb+texture(uLow,vUv+vec2(-o.x,o.y)).rgb;low/=16.0;outColor=vec4(texture(uHigh,vUv).rgb+low*uScatter,1);}`;

class BloomExtractPass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, extractFs); }
  run(source: WebGLTexture, sourceWidth: number, sourceHeight: number, target: BloomTarget, exposure: WebGLTexture | undefined, manualExposure: number, settings: ResolvedBloomSettings): void {
    const g = this.gl;
    g.bindFramebuffer(g.FRAMEBUFFER, target.framebuffer);
    g.viewport(0, 0, target.width, target.height);
    g.disable(g.DEPTH_TEST);
    this.program.use();
    g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, source); g.uniform1i(this.program.uniform('uSource'), 0);
    g.activeTexture(g.TEXTURE1); g.bindTexture(g.TEXTURE_2D, exposure ?? source); g.uniform1i(this.program.uniform('uExposure'), 1);
    g.uniform1i(this.program.uniform('uAutoExposure'), exposure ? 1 : 0);
    g.uniform1f(this.program.uniform('uManualExposure'), manualExposure);
    g.uniform1f(this.program.uniform('uThreshold'), settings.threshold);
    g.uniform1f(this.program.uniform('uKnee'), settings.softKnee);
    g.uniform2f(this.program.uniform('uInvSourceSize'), 1 / sourceWidth, 1 / sourceHeight);
    this.draw();
  }
}

class BloomDownsamplePass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, downsampleFs); }
  run(source: BloomTarget, target: BloomTarget): void {
    const g = this.gl;
    g.bindFramebuffer(g.FRAMEBUFFER, target.framebuffer); g.viewport(0, 0, target.width, target.height);
    this.program.use(); g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, source.texture); g.uniform1i(this.program.uniform('uSource'), 0); g.uniform2f(this.program.uniform('uInvSourceSize'), 1 / source.width, 1 / source.height); this.draw();
  }
}

class BloomUpsamplePass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, upsampleFs); }
  run(high: BloomTarget, low: BloomTarget, target: BloomTarget, scatter: number): void {
    const g = this.gl;
    g.bindFramebuffer(g.FRAMEBUFFER, target.framebuffer); g.viewport(0, 0, target.width, target.height);
    this.program.use(); g.activeTexture(g.TEXTURE0); g.bindTexture(g.TEXTURE_2D, high.texture); g.uniform1i(this.program.uniform('uHigh'), 0); g.activeTexture(g.TEXTURE1); g.bindTexture(g.TEXTURE_2D, low.texture); g.uniform1i(this.program.uniform('uLow'), 1); g.uniform2f(this.program.uniform('uInvLowSize'), 1 / low.width, 1 / low.height); g.uniform1f(this.program.uniform('uScatter'), scatter); this.draw();
  }
}

export class BloomPass {
  private levels: BloomTarget[] = [];
  private scratch: BloomTarget[] = [];
  private sourceWidth = 0;
  private sourceHeight = 0;
  private levelCount = 0;
  private scale = 0;
  private hdr = false;
  private extract: BloomExtractPass;
  private downsample: BloomDownsamplePass;
  private upsample: BloomUpsamplePass;

  constructor(readonly gl: WebGL2RenderingContext, readonly capabilities: RendererCapabilities) {
    this.extract = new BloomExtractPass(gl);
    this.downsample = new BloomDownsamplePass(gl);
    this.upsample = new BloomUpsamplePass(gl);
  }

  render(source: WebGLTexture, width: number, height: number, exposure: WebGLTexture | undefined, manualExposure: number, settings: ResolvedBloomSettings, hdr: boolean): WebGLTexture {
    this.ensure(width, height, settings.levels, settings.resolutionScale, hdr);
    this.extract.run(source, width, height, this.levels[0], exposure, manualExposure, settings);
    for (let i = 1; i < this.levels.length; i++) this.downsample.run(this.levels[i - 1], this.levels[i]);
    let low = this.levels[this.levels.length - 1];
    for (let i = this.levels.length - 2; i >= 0; i--) {
      this.upsample.run(this.levels[i], low, this.scratch[i], settings.scatter);
      low = this.scratch[i];
    }
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return low.texture;
  }

  get levelsUsed(): number { return this.levels.length; }

  private ensure(width: number, height: number, levels: number, scale: number, hdr: boolean): void {
    const wantsHdr = hdr && this.capabilities.colorBufferFloat;
    if (this.sourceWidth === width && this.sourceHeight === height && this.levelCount === levels && this.scale === scale && this.hdr === wantsHdr && this.levels.length) return;
    this.release();
    this.sourceWidth = width; this.sourceHeight = height; this.levelCount = levels; this.scale = scale; this.hdr = wantsHdr;
    let w = Math.max(1, Math.floor(width * scale));
    let h = Math.max(1, Math.floor(height * scale));
    for (let i = 0; i < levels; i++) {
      this.levels.push(this.allocate(w, h));
      if (i < levels - 1) this.scratch.push(this.allocate(w, h));
      if (w === 1 && h === 1) break;
      w = Math.max(1, Math.floor(w / 2)); h = Math.max(1, Math.floor(h / 2));
    }
    while (this.scratch.length > Math.max(0, this.levels.length - 1)) {
      const target = this.scratch.pop()!; this.gl.deleteTexture(target.texture); this.gl.deleteFramebuffer(target.framebuffer);
    }
  }

  private allocate(width: number, height: number): BloomTarget {
    const g = this.gl; const texture = g.createTexture(); const framebuffer = g.createFramebuffer();
    if (!texture || !framebuffer) throw new Error('Failed to allocate bloom target');
    g.bindTexture(g.TEXTURE_2D, texture); const filter = !this.hdr || this.capabilities.floatLinearFiltering ? g.LINEAR : g.NEAREST;
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, filter); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, filter); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    if (this.hdr) g.texImage2D(g.TEXTURE_2D, 0, g.RGBA16F, width, height, 0, g.RGBA, g.HALF_FLOAT, null); else g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, width, height, 0, g.RGBA, g.UNSIGNED_BYTE, null);
    g.bindFramebuffer(g.FRAMEBUFFER, framebuffer); g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0); if (g.checkFramebufferStatus(g.FRAMEBUFFER) !== g.FRAMEBUFFER_COMPLETE) throw new Error('Incomplete bloom framebuffer'); g.bindFramebuffer(g.FRAMEBUFFER, null); return { texture, framebuffer, width, height };
  }

  private release(): void {
    for (const target of [...this.levels, ...this.scratch]) { this.gl.deleteTexture(target.texture); this.gl.deleteFramebuffer(target.framebuffer); }
    this.levels = []; this.scratch = []; this.sourceWidth = this.sourceHeight = this.levelCount = 0; this.scale = 0; this.hdr = false;
  }

  dispose(): void { this.release(); this.extract.dispose(); this.downsample.dispose(); this.upsample.dispose(); }
}
