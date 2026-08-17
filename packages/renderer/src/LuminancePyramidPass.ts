import { FullscreenPass } from './FullscreenPass';
import type { RendererCapabilities } from './Capabilities';

export interface LuminanceLevel {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  width: number;
  height: number;
}

const firstFs = `#version 300 es
precision highp float;
in vec2 vUv;
out float outLogLuminance;
uniform sampler2D uSource;
uniform vec2 uInvSourceSize;
float logLum(vec3 c){float l=max(dot(max(c,vec3(0.0)),vec3(.2126,.7152,.0722)),1e-5);return log2(l);}
void main(){vec2 o=uInvSourceSize*2.0;float s=0.0;s+=logLum(texture(uSource,clamp(vUv+vec2(-o.x,-o.y),vec2(0),vec2(1))).rgb);s+=logLum(texture(uSource,clamp(vUv+vec2(o.x,-o.y),vec2(0),vec2(1))).rgb);s+=logLum(texture(uSource,clamp(vUv+vec2(-o.x,o.y),vec2(0),vec2(1))).rgb);s+=logLum(texture(uSource,clamp(vUv+vec2(o.x,o.y),vec2(0),vec2(1))).rgb);outLogLuminance=s*.25;}`;

const reduceFs = `#version 300 es
precision highp float;
in vec2 vUv;
out float outLogLuminance;
uniform sampler2D uSource;
uniform vec2 uInvSourceSize;
void main(){vec2 o=uInvSourceSize*.5;float s=texture(uSource,clamp(vUv+vec2(-o.x,-o.y),vec2(0),vec2(1))).r;s+=texture(uSource,clamp(vUv+vec2(o.x,-o.y),vec2(0),vec2(1))).r;s+=texture(uSource,clamp(vUv+vec2(-o.x,o.y),vec2(0),vec2(1))).r;s+=texture(uSource,clamp(vUv+vec2(o.x,o.y),vec2(0),vec2(1))).r;outLogLuminance=s*.25;}`;

class FirstLuminancePass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, firstFs); }
  run(source: WebGLTexture, sourceWidth: number, sourceHeight: number, target: LuminanceLevel): void {
    const g = this.gl;
    g.bindFramebuffer(g.FRAMEBUFFER, target.framebuffer);
    g.viewport(0, 0, target.width, target.height);
    g.disable(g.DEPTH_TEST);
    this.program.use();
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, source);
    g.uniform1i(this.program.uniform('uSource'), 0);
    g.uniform2f(this.program.uniform('uInvSourceSize'), 1 / sourceWidth, 1 / sourceHeight);
    this.draw();
  }
}

class ReduceLuminancePass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, reduceFs); }
  run(source: LuminanceLevel, target: LuminanceLevel): void {
    const g = this.gl;
    g.bindFramebuffer(g.FRAMEBUFFER, target.framebuffer);
    g.viewport(0, 0, target.width, target.height);
    this.program.use();
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, source.texture);
    g.uniform1i(this.program.uniform('uSource'), 0);
    g.uniform2f(this.program.uniform('uInvSourceSize'), 1 / source.width, 1 / source.height);
    this.draw();
  }
}

export class LuminancePyramidPass {
  readonly supported: boolean;
  private levels: LuminanceLevel[] = [];
  private sourceWidth = 0;
  private sourceHeight = 0;
  private first: FirstLuminancePass;
  private reduce: ReduceLuminancePass;

  constructor(readonly gl: WebGL2RenderingContext, capabilities: RendererCapabilities) {
    this.supported = capabilities.colorBufferFloat;
    this.first = new FirstLuminancePass(gl);
    this.reduce = new ReduceLuminancePass(gl);
  }

  render(source: WebGLTexture, width: number, height: number): WebGLTexture | undefined {
    if (!this.supported) return undefined;
    this.ensure(width, height);
    this.first.run(source, width, height, this.levels[0]);
    for (let i = 1; i < this.levels.length; i++) this.reduce.run(this.levels[i - 1], this.levels[i]);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return this.levels[this.levels.length - 1].texture;
  }

  get levelCount(): number { return this.levels.length; }

  private ensure(width: number, height: number): void {
    if (this.sourceWidth === width && this.sourceHeight === height && this.levels.length) return;
    this.release();
    this.sourceWidth = width;
    this.sourceHeight = height;
    let w = Math.max(1, Math.ceil(width / 8));
    let h = Math.max(1, Math.ceil(height / 8));
    while (true) {
      this.levels.push(this.allocate(w, h));
      if (w === 1 && h === 1) break;
      w = Math.max(1, Math.ceil(w / 2));
      h = Math.max(1, Math.ceil(h / 2));
    }
  }

  private allocate(width: number, height: number): LuminanceLevel {
    const g = this.gl;
    const texture = g.createTexture();
    const framebuffer = g.createFramebuffer();
    if (!texture || !framebuffer) throw new Error('Failed to allocate luminance pyramid');
    g.bindTexture(g.TEXTURE_2D, texture);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, g.R16F, width, height, 0, g.RED, g.HALF_FLOAT, null);
    g.bindFramebuffer(g.FRAMEBUFFER, framebuffer);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);
    if (g.checkFramebufferStatus(g.FRAMEBUFFER) !== g.FRAMEBUFFER_COMPLETE) throw new Error('Incomplete luminance framebuffer');
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    return { texture, framebuffer, width, height };
  }

  private release(): void {
    for (const level of this.levels) {
      this.gl.deleteTexture(level.texture);
      this.gl.deleteFramebuffer(level.framebuffer);
    }
    this.levels = [];
    this.sourceWidth = this.sourceHeight = 0;
  }

  dispose(): void {
    this.release();
    this.first.dispose();
    this.reduce.dispose();
  }
}
