export interface AutoExposureSettings {
  enabled?: boolean;
  keyValue?: number;
  minEv?: number;
  maxEv?: number;
  speedUp?: number;
  speedDown?: number;
}

export interface BloomSettings {
  enabled?: boolean;
  threshold?: number;
  softKnee?: number;
  intensity?: number;
  levels?: number;
  resolutionScale?: number;
  scatter?: number;
}

export interface ProductionPostSettings {
  exposure?: AutoExposureSettings;
  bloom?: BloomSettings;
}

export interface ResolvedAutoExposureSettings {
  enabled: boolean;
  keyValue: number;
  minEv: number;
  maxEv: number;
  speedUp: number;
  speedDown: number;
}

export interface ResolvedBloomSettings {
  enabled: boolean;
  threshold: number;
  softKnee: number;
  intensity: number;
  levels: number;
  resolutionScale: number;
  scatter: number;
}

export interface ResolvedProductionPostSettings {
  exposure: ResolvedAutoExposureSettings;
  bloom: ResolvedBloomSettings;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export function resolveProductionPostSettings(
  input: ProductionPostSettings = {},
  qualityScale = 1,
  bloomBudgetScale = 1,
): ResolvedProductionPostSettings {
  const exposure = input.exposure ?? {};
  const bloom = input.bloom ?? {};
  const minEv = clamp(exposure.minEv ?? -8, -16, 16);
  const maxEv = clamp(exposure.maxEv ?? 8, minEv, 16);
  const effective = clamp(qualityScale * bloomBudgetScale, 0.2, 1);
  return {
    exposure: {
      enabled: exposure.enabled ?? true,
      keyValue: clamp(exposure.keyValue ?? 0.18, 0.01, 2),
      minEv,
      maxEv,
      speedUp: clamp(exposure.speedUp ?? 3, 0.01, 20),
      speedDown: clamp(exposure.speedDown ?? 1.5, 0.01, 20),
    },
    bloom: {
      enabled: bloom.enabled ?? true,
      threshold: clamp(bloom.threshold ?? 1, 0, 32),
      softKnee: clamp(bloom.softKnee ?? 0.5, 0.001, 8),
      intensity: clamp(bloom.intensity ?? 0.08, 0, 4),
      levels: clamp(Math.round((bloom.levels ?? 5) * (0.6 + 0.4 * effective)), 2, 6),
      resolutionScale: clamp((bloom.resolutionScale ?? 0.5) * Math.sqrt(effective), 0.25, 0.5),
      scatter: clamp(bloom.scatter ?? 0.72, 0, 1),
    },
  };
}
