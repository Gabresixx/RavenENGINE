import type { MotionIntent } from './MotionIntent';
export interface MotionPhase { leftFoot:number; rightFoot:number; stride:number; pelvisHeight:number; pelvisYaw:number; shoulderCounter:number; }
const fract=(x:number)=>x-Math.floor(x);
export class ProceduralMotionField {
  phase=0;
  sample(intent:MotionIntent,dt:number):MotionPhase{
    const speed=Math.hypot(intent.desiredVelocity[0],intent.desiredVelocity[2]);const strideRate=1.25+speed*0.55;this.phase=fract(this.phase+dt*strideRate);
    const l=this.phase,r=fract(this.phase+0.5);const wave=(p:number)=>Math.sin(p*Math.PI*2);
    return{leftFoot:wave(l),rightFoot:wave(r),stride:Math.min(1,speed/4),pelvisHeight:-Math.abs(Math.sin(this.phase*Math.PI*2))*0.025,pelvisYaw:wave(this.phase)*0.055,shoulderCounter:-wave(this.phase)*0.07};
  }
}
