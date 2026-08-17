export interface ImportanceInput { radius:number; distance:number; viewportHeight:number; focalLengthPx:number; heroWeight?:number; interactionWeight?:number; }

export function projectedImportance(i:ImportanceInput):number{
  const d=Math.max(0.001,i.distance);
  const projectedDiameterPx=(2*i.radius*i.focalLengthPx)/d;
  const coverage=Math.min(1,projectedDiameterPx/Math.max(1,i.viewportHeight));
  return coverage*(i.heroWeight??1)*(i.interactionWeight??1);
}
