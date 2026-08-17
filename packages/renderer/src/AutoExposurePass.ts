import { FullscreenPass } from './FullscreenPass';
import type { RendererCapabilities } from './Capabilities';
import type { ResolvedAutoExposureSettings } from './PostProcessing';

const fs = `#version 300 es
precision highp float;
in vec2 vUv;
out float outExposure;
uniform sampler2D uLogLuminance;
uniform sampler2D uPreviousExposure;
uniform bool uHistoryValid;
uniform float uDeltaSeconds;
uniform float uKeyValue;
uniform float uMinEv;
uniform float uMaxEv;
uniform float uSpeedUp;
uniform float uSpeedDown;
void main(){float logLum=texelFetch(uLogLuminance,ivec2(0),0).r;float luminance=max(exp2(logLum),1e-5);float target=clamp(log2(uKeyValue/luminance),uMinEv,uMaxEv);if(!uHistoryValid){outExposure=target;return;}float previous=texelFetch(uPreviousExposure,ivec2(0),0).r;float speed=target<previous?uSpeedUp:uSpeedDown;float alpha=1.0-exp(-max(uDeltaSeconds,0.0)*speed);outExposure=mix(previous,target,clamp(alpha,0.0,1.0));}`;

export class AutoExposurePass extends FullscreenPass {
  readonly supported: boolean;
  private textures: WebGLTexture[] = [];
  private framebuffers: WebGLFramebuffer[] = [];
  private readIndex = 0;
  private historyValid = false;

  constructor(gl: WebGL2RenderingContext, capabilities: RendererCapabilities) {
    super(gl, fs);
    this.supported = capabilities.colorBufferFloat;
    if (this.supported) this.allocate();
  }

  render(logLuminance: WebGLTexture, deltaSeconds: number, settings: ResolvedAutoExposureSettings): WebGLTexture | undefined {
    if (!this.supported) return undefined;
    const writeIndex = 1 - this.readIndex;
    const g = this.gl;
    g.bindFramebuffer(g.FRAMEBUFFER, this.framebuffers[writeIndex]);
    g.viewport(0, 0, 1, 1);
    g.disable(g.DEPTH_TEST);
    this.program.use();
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D, logLuminance);
    g.uniform1i(this.program.uniform('uLogLuminance'), 0);
    g.activeTexture(g.TEXTURE1);
    g.bindTexture(g.TEXTURE_2D, this.textures[this.readIndex]);
    g.uniform1i(this.program.uniform('uPreviousExposure'), 1);
    g.uniform1i(this.program.uniform('uHistoryValid'), this.historyValid ? 1 : 0);
    g.uniform1f(this.program.uniform('uDeltaSeconds'), Math.max(0, Math.min(0.25, deltaSeconds)));
    g.uniform1f(this.program.uniform('uKeyValue'), settings.keyValue);
    g.uniform1f(this.program.uniform('uMinEv'), settings.minEv);
    g.uniform1f(this.program.uniform('uMaxEv'), settings.maxEv);
    g.uniform1f(this.program.uniform('uSpeedUp'), settings.speedUp);
    g.uniform1f(this.program.uniform('uSpeedDown'), settings.speedDown);
    this.draw();
    g.enable(g.DEPTH_TEST);
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    this.readIndex = writeIndex;
    this.historyValid = true;
    return this.textures[this.readIndex];
  }

  invalidate(): void { this.historyValid = false; }

  private allocate(): void {
    const g = this.gl;
    for (let i = 0; i < 2; i++) {
      const texture = g.createTexture();
      const framebuffer = g.createFramebuffer();
      if (!texture || !framebuffer) throw new Error('Failed to allocate auto exposure state');
      g.bindTexture(g.TEXTURE_2D, texture);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texImage2D(g.TEXTURE_2D, 0, g.R16F, 1, 1, 0, g.RED, g.HALF_FLOAT, null);
      g.bindFramebuffer(g.FRAMEBUFFER, framebuffer);
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);
      if (g.checkFramebufferStatus(g.FRAMEBUFFER) !== g.FRAMEBUFFER_COMPLETE) throw new Error('Incomplete auto exposure framebuffer');
      this.textures.push(texture);
      this.framebuffers.push(framebuffer);
    }
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    g.bindTexture(g.TEXTURE_2D, null);
  }

  override dispose(): void {
    for (const texture of this.textures) this.gl.deleteTexture(texture);
    for (const framebuffer of this.framebuffers) this.gl.deleteFramebuffer(framebuffer);
    this.textures = [];
    this.framebuffers = [];
    super.dispose();
  }
}
