import { FullscreenPass } from './FullscreenPass';
import type { RendererCapabilities } from './Capabilities';
import type { DirectionalLightPacket, EnvironmentLightPacket, LocalLightPacket } from './Lighting';
import type { PbrCameraPacket, ShadowLightingBinding } from './PbrPass';
import { invertMat4 } from './ShadowCascades';
import type { FroxelAtlasLayout, ResolvedVolumetricAtmosphereSettings } from './VolumetricAtmosphere';

const MAX_VOLUMETRIC_LOCAL_LIGHTS = 8;

const fs = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outVolume;
uniform ivec2 uGridSize;
uniform ivec2 uAtlasTiles;
uniform int uDepthSlices;
uniform mat4 uInvViewProj;
uniform vec3 uCameraPos;
uniform float uNear;
uniform float uFar;
uniform float uDensity;
uniform float uBaseHeight;
uniform float uHeightFalloff;
uniform float uExtinction;
uniform vec3 uScatteringColor;
uniform float uAnisotropy;
uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform int uIntegrationSteps;
uniform int uFrame;
uniform int uLocalLightCount;
uniform vec4 uLocalPositionRange[8];
uniform vec4 uLocalColorIntensity[8];
uniform bool uHasShadows;
uniform sampler2DArrayShadow uShadowMap;
uniform mat4 uShadowMatrices[4];
uniform vec4 uCascadeSplits;
uniform int uCascadeCount;
uniform float uShadowBias;
const float PI=3.14159265359;
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float hg(float cosine,float g){float g2=g*g;return(1.0-g2)/(4.0*PI*pow(max(1.0+g2-2.0*g*cosine,1e-4),1.5));}
vec3 worldFar(vec2 uv){vec4 p=uInvViewProj*vec4(uv*2.0-1.0,1.0,1.0);return p.xyz/p.w;}
float shadowAt(vec3 p){if(!uHasShadows||uCascadeCount<=0)return 1.0;float d=length(p-uCameraPos);int c=0;if(uCascadeCount>1&&d>uCascadeSplits.x)c=1;if(uCascadeCount>2&&d>uCascadeSplits.y)c=2;if(uCascadeCount>3&&d>uCascadeSplits.z)c=3;if(d>uCascadeSplits[c])return 1.0;vec4 lp=uShadowMatrices[c]*vec4(p,1.0);vec3 uv=lp.xyz/lp.w*.5+.5;if(any(lessThan(uv,vec3(0.0)))||any(greaterThan(uv,vec3(1.0))))return 1.0;return texture(uShadowMap,vec4(uv.xy,float(c),uv.z-uShadowBias));}
vec3 localRadiance(vec3 p,vec3 viewToCamera){vec3 sum=vec3(0.0);for(int i=0;i<8;i++){if(i>=uLocalLightCount)break;vec4 pr=uLocalPositionRange[i],ci=uLocalColorIntensity[i];vec3 toLight=pr.xyz-p;float distance=length(toLight),range=max(pr.w,.001);if(distance>=range)continue;vec3 L=toLight/max(distance,1e-4);float x=distance/range,window=max(0.0,1.0-x*x*x*x);float attenuation=window*window/max(distance*distance,.08);sum+=ci.rgb*(ci.a*attenuation)*hg(dot(L,viewToCamera),uAnisotropy);}return sum;}
void main(){
  ivec2 pixel=ivec2(gl_FragCoord.xy-vec2(.5));
  ivec2 tile=pixel/uGridSize;
  int slice=tile.y*uAtlasTiles.x+tile.x;
  if(slice>=uDepthSlices){outVolume=vec4(0,0,0,1);return;}
  ivec2 local=pixel-tile*uGridSize;
  vec2 screenUv=(vec2(local)+.5)/vec2(uGridSize);
  vec3 ray=normalize(worldFar(screenUv)-uCameraPos);
  float sliceT=float(slice+1)/float(uDepthSlices);
  float endDistance=uNear*pow(max(uFar/uNear,1.0001),sliceT);
  float stepLength=endDistance/float(max(uIntegrationSteps,1));
  float jitter=hash12(vec2(local)+float(slice)*vec2(19.19,7.73)+float(uFrame)*vec2(5.31,13.17));
  vec3 viewToCamera=-ray;
  vec3 sunL=normalize(-uLightDir);
  float sunPhase=hg(dot(sunL,viewToCamera),uAnisotropy);
  vec3 scattering=vec3(0.0);
  float transmittance=1.0;
  for(int i=0;i<12;i++){
    if(i>=uIntegrationSteps)break;
    float travel=stepLength*(float(i)+.15+.7*jitter);
    vec3 p=uCameraPos+ray*travel;
    float above=max(p.y-uBaseHeight,0.0);
    float density=uDensity*exp(-above*uHeightFalloff);
    float sigmaT=max(density*uExtinction,0.0);
    if(sigmaT<1e-6)continue;
    float segmentT=exp(-sigmaT*stepLength);
    float integral=(1.0-segmentT)/sigmaT;
    float shadow=shadowAt(p);
    vec3 illumination=uAmbientColor*uAmbientIntensity/(4.0*PI);
    illumination+=uLightColor*uLightIntensity*sunPhase*shadow;
    illumination+=localRadiance(p,viewToCamera);
    vec3 sigmaS=sigmaT*uScatteringColor;
    scattering+=transmittance*sigmaS*illumination*integral;
    transmittance*=segmentT;
    if(transmittance<.005){transmittance=0.0;break;}
  }
  outVolume=vec4(scattering,transmittance);
}`;

export interface VolumetricFroxelRenderInput {
  camera: PbrCameraPacket;
  layout: FroxelAtlasLayout;
  settings: ResolvedVolumetricAtmosphereSettings;
  directional: DirectionalLightPacket;
  environment: EnvironmentLightPacket;
  localLights: readonly LocalLightPacket[];
  shadow?: ShadowLightingBinding;
  frame: number;
  hdr: boolean;
}

export class VolumetricFroxelPass extends FullscreenPass {
  texture!: WebGLTexture;
  framebuffer!: WebGLFramebuffer;
  width = 0;
  height = 0;
  private hdr = false;

  constructor(gl: WebGL2RenderingContext, readonly capabilities: RendererCapabilities) {
    super(gl, fs);
  }

  ensure(layout: FroxelAtlasLayout, hdr: boolean): void {
    const wantsHdr = hdr && this.capabilities.colorBufferFloat;
    if (this.width === layout.atlasWidth && this.height === layout.atlasHeight && this.hdr === wantsHdr) return;
    this.release();
    const g = this.gl;
    const texture = g.createTexture();
    const framebuffer = g.createFramebuffer();
    if (!texture || !framebuffer) throw new Error('Failed to allocate volumetric froxel atlas');
    this.texture = texture;
    this.framebuffer = framebuffer;
    this.width = layout.atlasWidth;
    this.height = layout.atlasHeight;
    this.hdr = wantsHdr;
    g.bindTexture(g.TEXTURE_2D, texture);
    const filter = !wantsHdr || this.capabilities.floatLinearFiltering ? g.LINEAR : g.NEAREST;
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, filter);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, filter);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    if (wantsHdr) g.texImage2D(g.TEXTURE_2D, 0, g.RGBA16F, this.width, this.height, 0, g.RGBA, g.HALF_FLOAT, null);
    else g.texImage2D(g.TEXTURE_2D, 0, g.RGBA8, this.width, this.height, 0, g.RGBA, g.UNSIGNED_BYTE, null);
    g.bindFramebuffer(g.FRAMEBUFFER, framebuffer);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, texture, 0);
    if (g.checkFramebufferStatus(g.FRAMEBUFFER) !== g.FRAMEBUFFER_COMPLETE) throw new Error('Incomplete volumetric froxel framebuffer');
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    g.bindTexture(g.TEXTURE_2D, null);
  }

  render(input: VolumetricFroxelRenderInput): WebGLTexture {
    const inv = invertMat4(input.camera.viewProj);
    if (!inv) throw new Error('Cannot invert camera matrix for volumetric injection');
    this.ensure(input.layout, input.hdr);
    const g = this.gl;
    const p = this.program;
    const near = Math.max(input.camera.near ?? 0.1, 0.05);
    const far = Math.max(near + 0.01, Math.min(input.settings.maxDistance, input.camera.far ?? input.settings.maxDistance));
    g.bindFramebuffer(g.FRAMEBUFFER, this.framebuffer);
    g.viewport(0, 0, this.width, this.height);
    g.disable(g.DEPTH_TEST);
    p.use();
    g.uniform2i(p.uniform('uGridSize'), input.layout.gridWidth, input.layout.gridHeight);
    g.uniform2i(p.uniform('uAtlasTiles'), input.layout.columns, input.layout.rows);
    g.uniform1i(p.uniform('uDepthSlices'), input.layout.depthSlices);
    g.uniformMatrix4fv(p.uniform('uInvViewProj'), false, inv);
    g.uniform3fv(p.uniform('uCameraPos'), input.camera.position);
    g.uniform1f(p.uniform('uNear'), near);
    g.uniform1f(p.uniform('uFar'), far);
    g.uniform1f(p.uniform('uDensity'), input.settings.density);
    g.uniform1f(p.uniform('uBaseHeight'), input.settings.baseHeight);
    g.uniform1f(p.uniform('uHeightFalloff'), input.settings.heightFalloff);
    g.uniform1f(p.uniform('uExtinction'), input.settings.extinction);
    g.uniform3fv(p.uniform('uScatteringColor'), input.settings.scatteringColor);
    g.uniform1f(p.uniform('uAnisotropy'), input.settings.anisotropy);
    const ground = input.environment.groundColor ?? [0.03, 0.035, 0.04];
    g.uniform3f(p.uniform('uAmbientColor'), (input.environment.skyColor[0] + ground[0]) * 0.5, (input.environment.skyColor[1] + ground[1]) * 0.5, (input.environment.skyColor[2] + ground[2]) * 0.5);
    g.uniform1f(p.uniform('uAmbientIntensity'), input.settings.ambientIntensity * (input.environment.intensity ?? 1));
    g.uniform3fv(p.uniform('uLightDir'), input.directional.direction);
    g.uniform3fv(p.uniform('uLightColor'), input.directional.color);
    g.uniform1f(p.uniform('uLightIntensity'), input.directional.intensity);
    g.uniform1i(p.uniform('uIntegrationSteps'), input.settings.integrationSteps);
    g.uniform1i(p.uniform('uFrame'), input.frame & 0x7fffffff);
    this.bindLocalLights(input.localLights);
    this.bindShadows(input.shadow);
    this.draw();
    g.enable(g.DEPTH_TEST);
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    return this.texture;
  }

  private bindLocalLights(lights: readonly LocalLightPacket[]): void {
    const g = this.gl;
    const p = this.program;
    const count = Math.min(MAX_VOLUMETRIC_LOCAL_LIGHTS, lights.length);
    const positions = new Float32Array(MAX_VOLUMETRIC_LOCAL_LIGHTS * 4);
    const colors = new Float32Array(MAX_VOLUMETRIC_LOCAL_LIGHTS * 4);
    for (let i = 0; i < count; i++) {
      const light = lights[i];
      const offset = i * 4;
      positions.set([light.position[0], light.position[1], light.position[2], Math.max(0.001, light.range)], offset);
      colors.set([light.color[0], light.color[1], light.color[2], Math.max(0, light.intensity)], offset);
    }
    g.uniform1i(p.uniform('uLocalLightCount'), count);
    g.uniform4fv(p.uniform('uLocalPositionRange[0]'), positions);
    g.uniform4fv(p.uniform('uLocalColorIntensity[0]'), colors);
  }

  private bindShadows(shadow?: ShadowLightingBinding): void {
    const g = this.gl;
    const p = this.program;
    if (!shadow || !shadow.cascades.length) {
      g.uniform1i(p.uniform('uHasShadows'), 0);
      g.uniform1i(p.uniform('uCascadeCount'), 0);
      return;
    }
    const count = Math.min(4, shadow.cascades.length);
    const matrices = new Float32Array(64);
    const splits = new Float32Array(4);
    for (let i = 0; i < count; i++) {
      matrices.set(shadow.cascades[i].matrix, i * 16);
      splits[i] = shadow.cascades[i].split.far;
    }
    for (let i = count; i < 4; i++) splits[i] = splits[Math.max(0, count - 1)];
    g.uniform1i(p.uniform('uHasShadows'), 1);
    g.uniform1i(p.uniform('uCascadeCount'), count);
    g.uniformMatrix4fv(p.uniform('uShadowMatrices[0]'), false, matrices);
    g.uniform4fv(p.uniform('uCascadeSplits'), splits);
    g.uniform1f(p.uniform('uShadowBias'), shadow.bias);
    g.activeTexture(g.TEXTURE0);
    g.bindTexture(g.TEXTURE_2D_ARRAY, shadow.texture);
    g.uniform1i(p.uniform('uShadowMap'), 0);
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
