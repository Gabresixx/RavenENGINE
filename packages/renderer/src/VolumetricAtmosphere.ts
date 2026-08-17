export interface VolumetricAtmosphereSettings {
  enabled?: boolean;
  density?: number;
  baseHeight?: number;
  heightFalloff?: number;
  extinction?: number;
  scatteringColor?: [number, number, number];
  anisotropy?: number;
  maxDistance?: number;
  froxelPixelSize?: number;
  depthSlices?: number;
  integrationSteps?: number;
  ambientIntensity?: number;
}

export interface ResolvedVolumetricAtmosphereSettings {
  enabled: boolean;
  density: number;
  baseHeight: number;
  heightFalloff: number;
  extinction: number;
  scatteringColor: [number, number, number];
  anisotropy: number;
  maxDistance: number;
  froxelPixelSize: number;
  depthSlices: number;
  integrationSteps: number;
  ambientIntensity: number;
}

export interface FroxelAtlasLayout {
  gridWidth: number;
  gridHeight: number;
  depthSlices: number;
  columns: number;
  rows: number;
  atlasWidth: number;
  atlasHeight: number;
  pixelSize: number;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export function resolveVolumetricAtmosphereSettings(
  input: VolumetricAtmosphereSettings = {},
  qualityScale = 1,
  budgetScale = 1,
): ResolvedVolumetricAtmosphereSettings {
  const effective = clamp(qualityScale * budgetScale, 0.2, 1);
  const basePixelSize = clamp(Math.round(input.froxelPixelSize ?? 12), 6, 32);
  const baseSlices = clamp(Math.round(input.depthSlices ?? 32), 8, 48);
  const baseSteps = clamp(Math.round(input.integrationSteps ?? 8), 4, 12);
  const scattering = input.scatteringColor ?? [0.92, 0.96, 1];
  return {
    enabled: input.enabled ?? true,
    density: clamp(input.density ?? 0.018, 0, 2),
    baseHeight: clamp(input.baseHeight ?? 0, -10000, 10000),
    heightFalloff: clamp(input.heightFalloff ?? 0.035, 0, 4),
    extinction: clamp(input.extinction ?? 1, 0, 8),
    scatteringColor: [clamp(scattering[0], 0, 1), clamp(scattering[1], 0, 1), clamp(scattering[2], 0, 1)],
    anisotropy: clamp(input.anisotropy ?? 0.55, -0.9, 0.9),
    maxDistance: clamp(input.maxDistance ?? 180, 4, 2000),
    froxelPixelSize: clamp(Math.round(basePixelSize / Math.sqrt(effective)), 6, 40),
    depthSlices: clamp(Math.round(baseSlices * (0.5 + 0.5 * effective)), 8, 48),
    integrationSteps: clamp(Math.round(baseSteps * (0.5 + 0.5 * effective)), 4, 12),
    ambientIntensity: clamp(input.ambientIntensity ?? 0.35, 0, 8),
  };
}

export function resolveFroxelAtlasLayout(
  width: number,
  height: number,
  requestedPixelSize: number,
  requestedDepthSlices: number,
  maxTextureSize: number,
): FroxelAtlasLayout {
  if (width < 1 || height < 1 || maxTextureSize < 1) throw new RangeError('Invalid froxel atlas dimensions');
  let pixelSize = clamp(Math.round(requestedPixelSize), 4, 64);
  let depthSlices = clamp(Math.round(requestedDepthSlices), 4, 64);

  const build = (): FroxelAtlasLayout => {
    const gridWidth = Math.max(1, Math.ceil(width / pixelSize));
    const gridHeight = Math.max(1, Math.ceil(height / pixelSize));
    const idealColumns = Math.sqrt((depthSlices * gridHeight) / gridWidth);
    const columns = clamp(Math.round(idealColumns), 1, depthSlices);
    const rows = Math.ceil(depthSlices / columns);
    return {
      gridWidth,
      gridHeight,
      depthSlices,
      columns,
      rows,
      atlasWidth: gridWidth * columns,
      atlasHeight: gridHeight * rows,
      pixelSize,
    };
  };

  let layout = build();
  while ((layout.atlasWidth > maxTextureSize || layout.atlasHeight > maxTextureSize) && pixelSize < 64) {
    pixelSize++;
    layout = build();
  }
  while ((layout.atlasWidth > maxTextureSize || layout.atlasHeight > maxTextureSize) && depthSlices > 4) {
    depthSlices--;
    layout = build();
  }
  if (layout.atlasWidth > maxTextureSize || layout.atlasHeight > maxTextureSize) {
    throw new Error('Unable to fit froxel atlas within WebGL2 texture limits');
  }
  return layout;
}
