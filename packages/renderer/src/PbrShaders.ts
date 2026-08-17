export const ravenPbrVertex=`#version 300 es
precision highp float;
layout(location=0)in vec3 aPosition;
layout(location=1)in vec3 aNormal;
layout(location=2)in vec2 aUv;
uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat3 uNormalMatrix;
out vec3 vWorldPos;
out vec3 vNormal;
out vec2 vUv;
void main(){vec4 w=uModel*vec4(aPosition,1.0);vWorldPos=w.xyz;vNormal=normalize(uNormalMatrix*aNormal);vUv=aUv;gl_Position=uViewProj*w;}`;

export const ravenPbrFragment=`#version 300 es
precision highp float;
precision highp usampler2D;
in vec3 vWorldPos;
in vec3 vNormal;
in vec2 vUv;
layout(location=0)out vec4 outColor;
layout(location=1)out vec4 outNormalRoughness;
layout(location=2)out vec4 outBaseColorMetal;
uniform vec3 uCameraPos;
uniform vec3 uBaseColor;
uniform float uRoughness;
uniform float uMetalness;
uniform vec3 uEmissive;
uniform float uAmbientOcclusion;
uniform float uReactive;
uniform float uWetness;
uniform bool uHasBaseColorMap;
uniform bool uHasNormalMap;
uniform bool uHasOrmMap;
uniform bool uHasEmissiveMap;
uniform sampler2D uBaseColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uOrmMap;
uniform sampler2D uEmissiveMap;
uniform int uMappingMode;
uniform vec2 uUvScale;
uniform vec2 uUvOffset;
uniform float uTriplanarScale;
uniform float uTriplanarSharpness;
uniform float uNormalScale;
uniform bool uDeferEnvironmentSpecular;
uniform bool uHasScreenAo;
uniform sampler2D uScreenAo;
uniform bool uHasContactShadow;
uniform sampler2D uContactShadow;
uniform vec2 uViewportSize;
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform float uEnvironmentIntensity;
uniform int uLocalLightCount;
uniform vec4 uLocalPositionRange[64];
uniform vec4 uLocalColorIntensity[64];
uniform bool uHasTiledLights;
uniform usampler2D uTileCounts;
uniform usampler2D uTileIndices;
uniform int uTileSize;
uniform bool uHasShadows;
uniform sampler2DArrayShadow uShadowMap;
uniform mat4 uShadowMatrices[4];
uniform vec4 uCascadeSplits;
uniform int uCascadeCount;
uniform float uShadowBias;
uniform float uShadowNormalBias;
const float PI=3.14159265359;
float D_GGX(float NoH,float a){float a2=a*a,d=NoH*NoH*(a2-1.0)+1.0;return a2/max(PI*d*d,1e-6);}
float V_SmithGGXCorrelated(float NoV,float NoL,float a){float a2=a*a,gv=NoL*sqrt(max(NoV*NoV*(1.0-a2)+a2,1e-6)),gl=NoV*sqrt(max(NoL*NoL*(1.0-a2)+a2,1e-6));return .5/max(gv+gl,1e-6);}
vec3 F_Schlick(vec3 f0,float VoH){float f=pow(1.0-VoH,5.0);return f0+(1.0-f0)*f;}
vec2 octEncode(vec3 n){n/=abs(n.x)+abs(n.y)+abs(n.z);vec2 e=n.xy;if(n.z<0.0)e=(1.0-abs(e.yx))*sign(e.xy);return e*.5+.5;}
vec3 triWeights(vec3 n){vec3 w=pow(max(abs(n),vec3(1e-4)),vec3(uTriplanarSharpness));return w/max(w.x+w.y+w.z,1e-5);}
vec4 sampleMapped(sampler2D map,vec3 N){if(uMappingMode==0)return texture(map,vUv*uUvScale+uUvOffset);vec3 w=triWeights(N),p=vWorldPos*uTriplanarScale;vec4 x=texture(map,p.zy),y=texture(map,p.xz),z=texture(map,p.xy);return x*w.x+y*w.y+z*w.z;}
vec3 triplanarNormal(vec3 N){vec3 w=triWeights(N),p=vWorldPos*uTriplanarScale,s=sign(N);vec3 nx=texture(uNormalMap,p.zy).xyz*2.0-1.0,ny=texture(uNormalMap,p.xz).xyz*2.0-1.0,nz=texture(uNormalMap,p.xy).xyz*2.0-1.0;nx.xy*=uNormalScale;ny.xy*=uNormalScale;nz.xy*=uNormalScale;vec3 wx=normalize(vec3(nx.z*s.x,nx.y,nx.x*s.x)),wy=normalize(vec3(ny.x,ny.z*s.y,ny.y*s.y)),wz=normalize(vec3(nz.x*s.z,nz.y,nz.z*s.z));vec3 mapped=normalize(wx*w.x+wy*w.y+wz*w.z);return dot(mapped,N)<0.0?-mapped:mapped;}
vec3 uvNormal(vec3 N){vec2 uv=vUv*uUvScale+uUvOffset;vec3 n=texture(uNormalMap,uv).xyz*2.0-1.0;n.xy*=uNormalScale;vec3 dp1=dFdx(vWorldPos),dp2=dFdy(vWorldPos);vec2 duv1=dFdx(uv),duv2=dFdy(uv);vec3 T=dp1*duv2.y-dp2*duv1.y,B=-dp1*duv2.x+dp2*duv1.x;float lt=dot(T,T),lb=dot(B,B);if(lt<1e-10||lb<1e-10)return N;T*=inversesqrt(lt);B*=inversesqrt(lb);if(dot(cross(T,B),N)<0.0)B=-B;return normalize(T*n.x+B*n.y+N*n.z);}
vec3 materialNormal(vec3 N){if(!uHasNormalMap)return N;return uMappingMode==0?uvNormal(N):triplanarNormal(N);}
vec3 evalBrdf(vec3 N,vec3 V,vec3 L,vec3 radiance,vec3 base,float metal,float rough){vec3 H=normalize(V+L);float NoL=max(dot(N,L),0.0),NoV=max(dot(N,V),1e-4),NoH=max(dot(N,H),0.0),VoH=max(dot(V,H),0.0);if(NoL<=0.0)return vec3(0);float a=max(.045,rough*rough),D=D_GGX(NoH,a),Vis=V_SmithGGXCorrelated(NoV,NoL,a);vec3 f0=mix(vec3(.04),base,metal),F=F_Schlick(f0,VoH),kd=(1.0-F)*(1.0-metal);return(kd*base/PI+D*Vis*F)*radiance*NoL;}
float sampleShadow(vec3 worldPos,vec3 N){if(!uHasShadows||uCascadeCount<=0)return 1.0;float d=length(worldPos-uCameraPos);int c=0;if(uCascadeCount>1&&d>uCascadeSplits.x)c=1;if(uCascadeCount>2&&d>uCascadeSplits.y)c=2;if(uCascadeCount>3&&d>uCascadeSplits.z)c=3;if(d>uCascadeSplits[c])return 1.0;vec4 lp=uShadowMatrices[c]*vec4(worldPos+N*uShadowNormalBias,1.0);vec3 uv=lp.xyz/lp.w*.5+.5;if(any(lessThan(uv,vec3(0)))||any(greaterThan(uv,vec3(1))))return 1.0;vec2 texel=1.0/vec2(textureSize(uShadowMap,0).xy);float s=0.0;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++)s+=texture(uShadowMap,vec4(uv.xy+vec2(x,y)*texel,float(c),uv.z-uShadowBias));return s/9.0;}
vec3 localLighting(vec3 N,vec3 V,vec3 base,float metal,float rough){if(!uHasTiledLights||uLocalLightCount<=0)return vec3(0);ivec2 tile=ivec2(gl_FragCoord.xy)/uTileSize;uint count=texelFetch(uTileCounts,tile,0).r;vec3 sum=vec3(0);for(int slot=0;slot<32;slot++){if(uint(slot)>=count)break;int texelX=tile.x*8+slot/4;uvec4 packed=texelFetch(uTileIndices,ivec2(texelX,tile.y),0);uint idx=packed[slot&3];if(idx>=uint(uLocalLightCount)||idx==255u)continue;vec4 pr=uLocalPositionRange[int(idx)],ci=uLocalColorIntensity[int(idx)];vec3 toL=pr.xyz-vWorldPos;float dist=length(toL),range=max(pr.w,.001);if(dist>=range)continue;vec3 L=toL/max(dist,1e-4);float x=dist/range,window=max(0.0,1.0-x*x*x*x);float attenuation=window*window/max(dist*dist,.05);sum+=evalBrdf(N,V,L,ci.rgb*(ci.a*attenuation),base,metal,rough);}return sum;}
void main(){vec3 geomN=normalize(vNormal);vec4 baseSample=uHasBaseColorMap?sampleMapped(uBaseColorMap,geomN):vec4(1);vec3 base=max(uBaseColor,vec3(0))*baseSample.rgb;vec3 orm=uHasOrmMap?sampleMapped(uOrmMap,geomN).rgb:vec3(1);float rough=clamp(uRoughness*orm.g,.045,1.0),metal=clamp(uMetalness*orm.b,0.0,1.0),ao=clamp(uAmbientOcclusion*orm.r,0.0,1.0),wet=clamp(uWetness,0.0,1.0);base*=mix(1.0,.78,wet*(1.0-metal));rough=mix(rough,max(.045,rough*.3),wet);vec3 N=materialNormal(geomN),V=normalize(uCameraPos-vWorldPos),L=normalize(-uLightDir);vec2 screenUv=gl_FragCoord.xy/uViewportSize;float screenAo=uHasScreenAo?texture(uScreenAo,screenUv).r:1.0;float contact=uHasContactShadow?texture(uContactShadow,screenUv).r:1.0;float shadow=sampleShadow(vWorldPos,N)*contact;vec3 direct=evalBrdf(N,V,L,uLightColor*uLightIntensity*shadow,base,metal,rough);vec3 local=localLighting(N,V,base,metal,rough);float hemi=dot(N,vec3(0,1,0))*.5+.5;vec3 env=mix(uGroundColor,uSkyColor,hemi)*uEnvironmentIntensity;vec3 f0=mix(vec3(.04),base,metal),F=F_Schlick(f0,max(dot(N,V),0.0)),kd=(1.0-F)*(1.0-metal);vec3 ambientDiffuse=kd*base*env*ao*screenAo;vec3 ambientSpec=uDeferEnvironmentSpecular?vec3(0):F*(1.0-rough*.65)*env*ao;vec3 emissiveFactor=uEmissive;vec3 emissiveSample=uHasEmissiveMap?sampleMapped(uEmissiveMap,geomN).rgb:vec3(1);outColor=vec4(direct+local+ambientDiffuse+ambientSpec+emissiveFactor*emissiveSample,clamp(uReactive,0.0,1.0));outNormalRoughness=vec4(octEncode(N),rough,metal);outBaseColorMetal=vec4(clamp(base,0.0,1.0),metal);}`;
