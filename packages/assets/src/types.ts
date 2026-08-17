export type AssetKind = 'hard-surface' | 'organic' | 'architecture' | 'terrain' | 'vegetation' | 'character';

export interface AssetRequest {
  key: string;
  kind: AssetKind;
  seed: number;
  qualityTier: 0 | 1 | 2 | 3;
  params: Readonly<Record<string, number | string | boolean>>;
}

export interface MeshBuffers {
  positions: Float32Array;
  normals: Float32Array;
  tangents?: Float32Array;
  uvs?: Float32Array;
  indices: Uint16Array | Uint32Array;
}

export interface BakedLod {
  screenError: number;
  mesh: MeshBuffers;
}

export interface BakedAsset {
  key: string;
  seed: number;
  lods: BakedLod[];
  collision?: MeshBuffers;
  materialSlots: string[];
  byteSize: number;
}
