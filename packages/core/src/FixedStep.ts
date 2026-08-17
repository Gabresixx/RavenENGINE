export interface FixedStepResult { steps:number; alpha:number; droppedMs:number; }
export class FixedStepClock {
  private accumulatorMs=0;
  constructor(readonly stepMs=1000/60,readonly maxSteps=4){}
  advance(deltaMs:number,step:(dtSeconds:number)=>void):FixedStepResult{
    this.accumulatorMs+=Math.min(deltaMs,this.stepMs*this.maxSteps*2);
    let steps=0;
    while(this.accumulatorMs>=this.stepMs&&steps<this.maxSteps){step(this.stepMs/1000);this.accumulatorMs-=this.stepMs;steps++;}
    let droppedMs=0;
    if(this.accumulatorMs>=this.stepMs){droppedMs=this.accumulatorMs-this.stepMs*.999;this.accumulatorMs-=droppedMs;}
    return{steps,alpha:this.accumulatorMs/this.stepMs,droppedMs};
  }
}
