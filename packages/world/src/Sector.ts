export interface SectorCoord { x: number; z: number; }
export type SectorState = 'unloaded' | 'proxy' | 'loading' | 'resident' | 'cooling';

export interface SectorRecord {
  key: string;
  coord: SectorCoord;
  state: SectorState;
  seed: number;
  lastVisibleFrame: number;
  projectedImportance: number;
}

export function sectorKey(x: number, z: number): string { return `${x}:${z}`; }
