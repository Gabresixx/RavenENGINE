export interface Vec3 { x: number; y: number; z: number; }

export interface SurfaceSample {
  height: number;
  normal: Vec3;
  materialId: number;
  moisture: number;
  waterDepth: number;
  occlusion: number;
  wind: Vec3;
}

export interface WorldFieldProvider {
  sample(x: number, z: number, out?: SurfaceSample): SurfaceSample;
}

export class CompositeWorldFields implements WorldFieldProvider {
  constructor(private readonly providers: WorldFieldProvider[]) {}

  sample(x: number, z: number): SurfaceSample {
    const result: SurfaceSample = {height:0,normal:{x:0,y:1,z:0},materialId:0,moisture:0,waterDepth:0,occlusion:0,wind:{x:0,y:0,z:0}};
    for (const provider of this.providers) {
      const next = provider.sample(x, z);
      result.height = next.height;
      result.normal = next.normal;
      result.materialId = next.materialId || result.materialId;
      result.moisture = Math.max(result.moisture, next.moisture);
      result.waterDepth = Math.max(result.waterDepth, next.waterDepth);
      result.occlusion = Math.max(result.occlusion, next.occlusion);
      result.wind.x += next.wind.x; result.wind.y += next.wind.y; result.wind.z += next.wind.z;
    }
    return result;
  }
}
