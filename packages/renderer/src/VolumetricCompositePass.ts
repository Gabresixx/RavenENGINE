import { FullscreenPass } from './FullscreenPass';
import type { RendererCapabilities } from './Capabilities';
import type { PbrCameraPacket } from './PbrPass';
import { invertMat4 } from './ShadowCascades';
import type { FroxelAtlasLayout, ResolvedVolumetricAtmosphereSettings } from './VolumetricAtmosphere';

const fs = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uScene;
uniform sampler2D uDepth;
uniform sampler2D uFroxelAtlas;
uniform mat4 uInvViewProj;
uniform vec3 uCameraPos;
uniform ivec2 uGridSize;
uniform ivec2 uAtlasTiles;
uniform ivec2 uAtlasSize;
uniform int uDepthSlices;
uniform float uNear;
uniform float uFar;
vec3 worldAt(vec2 uv,float d){vec4 p=uInvViewProj*vec4(uv*2.0-1.0,d*2.0-1.0,1.0);return p.xyz/p.w;}
vec4 sampleSlice(int slice){int sx=slice%uAtlasTiles.x,sy=slice/uAtlasTiles.x;vec2 local=.5+vUv*(vec2(uGridSize)-1.0);vec2 pixel=vec2(sx*uGridSize.x,sy*uGridSize.y)+local;return texture(uFroxelAtlas,pixel/vec2(uAtlasSize));}
void main(){vec4 scene=texture(uScene,vUv);float d=texture(uDepth,vUv).r;float distanceToCamera=d>=.999999?uFar:length(worldAt(vUv,d)-uCameraPos);float clamped=clamp(distanceToCamera,uNear,uFar);float denom=max(log(uFar/uNear),1e-5);float normalized=clamp(log(clamped/uNear)/denom,0.0,1.0);float sliceF=normalized*float(max(uDepthSlices-1,0));int a=int(floor(sliceF)),b=min(a+1,uDepthSlices-1);vec4 volume=mix(sampleSlice(a),sampleSlice(b),fract(sliceF));float reactive=max(scene.a,(1.0-volume.a)*.06);outColor=vec4(scene.rgb*volume.a+volume.rgb,reactive);}`;

export class VolumetricCompositePass extends FullscreenPass {
  texture!: WebGLTexture;
  framebuffer!: WebGLFramebuffer;
  width = 0;
  height = 0;
  private hdr = false;

  constructor(gl: WebGL2RenderingContext, readonly capabilities: RendererCapabilities) {
    super(gl, fs);
  }

  ensure(width: number, height: number, hdr: boolean): void {
    const wantsHdr = hdr && this.capabilities.colorBufferFloat;
    if (this.width === width && this.height === height && this.hdr === wantsHdr) return;
    this.release();
    const g = this.gl;
    const texture = g.createTexture();
    const framebuffer = g.createFramebuffer();
    if (!texture || !framebuffer) throw new Error('Failed to allocate volumetric composite target');
    this.texture = texture;
    this.framebuffer = framebuffer;
    this.width = width;
    this.height = height;
    this.hdr = wantsHdr;
    g.bindTexture(g.TEXTURE_2D, texture);
    const filter = !wantsHdr || this.capabilities.floatLinearFiltering ? g.LINEAR : g.NEAREST;
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, filter);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, filter);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    if (wantsHdr) g.texImage2D(g.TEXTURE_2D, 0, g.RGBA16F, width, height, 0, g.RGBA, g.HALF_FLOAT, null);
    else g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, width, height, 0, g.RGBA, g.UNSIGNED_BYTE, null);
    g.bindFramebuffer(g.FRAMEBUFFER, framebuffer);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);
    if (g.checkFramebufferStatus(g.FRAMEBUFFER) !== g.FRAMEBUFFER_COMPLETE) throw new Error('Incomplete volumetric composite framebuffer');
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    g.bindTexture(g.TEXTURE_2D, null);
  }

  render(
    scene: WebGLTexture,
    depth: WebGLTexture,
    froxelAtlas: WebGLTexture,
    camera: PbrCameraPacket,
    layout: FroxelAtlasLayout,
    settings: ResolvedVolumetricAtmosphereSettings,
    hdr: boolean,
  ): WebGLTexture {
    const inv = invertMat4(camera.viewProj);
    if (!inv) throw new Error('Cannot invert camera matrix for volumetric composite');
    this.ensure(this.width || 1, this.height || 1, hdr);
    const g = this.gl;
    const p = this.program;
    const near = Math.max(camera.near ?? 0.1, 0.05);
    const far = Math.max(near + 0.01, Math.min(settings.maxDistance, camera.far ?? settings.maxDistance));
    g.bindFramebuffer(g.FRAMEBUFFER, this.framebuffer);
    g.viewport(0, 0, this.width, this.height);
    g.disable(g.DEPTH_TEST);
    p.use();
    this.bind(0, 'uScene', scene);
    this.bind(1, 'uDepth', depth);
    this.bind(2, 'uFroxelAtlas', froxelAtlas);
    g.uniformMatrix4fv(p.uniform('uInvViewProj'), false, inv);
    g.uniform3fv(p.uniform('uCameraPos'), camera.position);
    g.uniform2i(p.uniform('uGridSize'), layout.gridWidth, layout.gridHeight);
    g.uniform2i(p.uniform('uAtlasTiles'), layout.columns, layout.rows);
    g.uniform2i(p.uniform('uAtlasSize'), layout.atlasWidth, layout.atlasHeight);
    g.uniform1i(p.uniform('uDepthSlices'), layout.depthSlices);
    g.uniform1f(p.uniform('uNear'), near);
    g.uniform1f(p.uniform('uFar'), far);
    this.draw();
    g.enable(g.DEPTH_TEST);
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    return this.texture;
  }

  private bind(unit: number, name: string, texture: WebGLTexture): void {
    const g = this.gl;
    g.activeTexture(g.TEXTURE0 + unit);
    g.bindTexture(g.TEXTURE_2D, texture);
    g.uniform1i(this.program.uniform(name), unit);
  }

  private release(): void {
    if (this.texture) this.gl.deleteTexture(this.texture);
    if (this.framebuffer) this.gl.deleteFramebuffer(this.framebuffer);
    this.texture = undefined as unknown as WebGLTexture;
    this.framebuffer = undefined as unknown as WebGLFramebuffer;
    this.width = this.height = 0;
    this.hdr = false;
  }

  override dispose(): void {
    this.release();
    super.dispose();
  }
}
