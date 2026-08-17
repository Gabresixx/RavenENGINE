import type { PoseBuffer, SkeletonDefinition } from './Skeleton';
import type { PredictedContact } from './MotionIntent';

export interface ContactSolveInput { skeleton:SkeletonDefinition; pose:PoseBuffer; contacts:readonly PredictedContact[]; dt:number; }

export class ContactSolver {
  solve(input:ContactSolveInput):void{
    // Foundation contract: concrete limb IK solvers plug in here.
    // Contacts are sorted in time so predicted support influences the body before penetration occurs.
    [...input.contacts].sort((a,b)=>a.timeToContact-b.timeToContact);
  }
}
