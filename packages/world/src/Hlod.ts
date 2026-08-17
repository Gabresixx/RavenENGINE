export type HlodLevel=0|1|2|3|4;
export interface HlodDecisionInput { projectedImportance:number; hero:boolean; memoryPressure:number; }
export function chooseHlod(i:HlodDecisionInput):HlodLevel{
  const p=i.projectedImportance*(i.hero?2.5:1)*(1-Math.min(0.7,i.memoryPressure*0.35));
  if(p>0.22)return 0;if(p>0.08)return 1;if(p>0.025)return 2;if(p>0.006)return 3;return 4;
}
