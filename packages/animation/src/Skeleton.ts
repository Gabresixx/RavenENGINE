export interface JointDefinition { name:string; parent:number; bindTranslation:[number,number,number]; }
export interface SkeletonDefinition { joints:readonly JointDefinition[]; }
export interface JointPose { translation:[number,number,number]; rotation:[number,number,number,number]; scale:[number,number,number]; }

export class PoseBuffer {
  readonly joints:JointPose[];
  constructor(skeleton:SkeletonDefinition){ this.joints=skeleton.joints.map(j=>({translation:[...j.bindTranslation],rotation:[0,0,0,1],scale:[1,1,1]})); }
}
