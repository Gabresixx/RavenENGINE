import type { PoseBuffer,SkeletonDefinition } from './Skeleton';
export class SkinningPalette {
  readonly matrices:Float32Array;
  constructor(readonly skeleton:SkeletonDefinition){this.matrices=new Float32Array(skeleton.joints.length*16);this.identity();}
  identity():void{this.matrices.fill(0);for(let i=0;i<this.skeleton.joints.length;i++){const o=i*16;this.matrices[o]=this.matrices[o+5]=this.matrices[o+10]=this.matrices[o+15]=1;}}
  fromPose(pose:PoseBuffer):void{for(let i=0;i<pose.joints.length;i++){const j=pose.joints[i],o=i*16,[x,y,z,w]=j.rotation,[sx,sy,sz]=j.scale,[tx,ty,tz]=j.translation;const x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;this.matrices[o]=(1-(yy+zz))*sx;this.matrices[o+1]=(xy+wz)*sx;this.matrices[o+2]=(xz-wy)*sx;this.matrices[o+3]=0;this.matrices[o+4]=(xy-wz)*sy;this.matrices[o+5]=(1-(xx+zz))*sy;this.matrices[o+6]=(yz+wx)*sy;this.matrices[o+7]=0;this.matrices[o+8]=(xz+wy)*sz;this.matrices[o+9]=(yz-wx)*sz;this.matrices[o+10]=(1-(xx+yy))*sz;this.matrices[o+11]=0;this.matrices[o+12]=tx;this.matrices[o+13]=ty;this.matrices[o+14]=tz;this.matrices[o+15]=1;}}
}
