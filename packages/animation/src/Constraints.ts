import type { PoseBuffer, SkeletonDefinition } from './Skeleton';
export interface ConstraintContext { dt:number; skeleton:SkeletonDefinition; pose:PoseBuffer; }
export interface PoseConstraint { priority:number; solve(ctx:ConstraintContext):void; }

export class ConstraintStack {
  private constraints:PoseConstraint[]=[];
  add(c:PoseConstraint):this{this.constraints.push(c);this.constraints.sort((a,b)=>b.priority-a.priority);return this;}
  solve(ctx:ConstraintContext):void{for(const c of this.constraints)c.solve(ctx);}
}
