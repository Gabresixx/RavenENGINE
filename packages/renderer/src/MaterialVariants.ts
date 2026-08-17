export type PbrMappingMode = 'uv' | 'triplanar';

export interface PbrMaterialTextureSet {
  baseColor?: WebGLTexture;
  normal?: WebGLTexture;
  orm?: WebGLTexture;
  emissive?: WebGLTexture;
}

export interface PbrMaterialMapping {
  mode?: PbrMappingMode;
  uvScale?: [number, number];
  uvOffset?: [number, number];
  triplanarScale?: number;
  triplanarSharpness?: number;
}

export interface PbrSurfaceState {
  wetness?: number;
}

export interface ResolvedPbrSurfaceState {
  wetness: number;
}

export function resolveMaterialMapping(requested: PbrMappingMode | undefined, hasUvs: boolean): PbrMappingMode {
  if (requested === 'triplanar') return 'triplanar';
  if (requested === 'uv' && hasUvs) return 'uv';
  return hasUvs ? 'uv' : 'triplanar';
}

export function resolvePbrSurfaceState(state: PbrSurfaceState | undefined): ResolvedPbrSurfaceState {
  return { wetness: Math.max(0, Math.min(1, state?.wetness ?? 0)) };
}
