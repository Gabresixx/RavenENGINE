export type DegradationStep='reduce-reflections'|'reduce-volumetrics'|'reduce-shadow-distance'|'reduce-render-scale'|'reduce-particles'|'reduce-geometry'|'reduce-animation';

export class DegradationLadder {
  private readonly order:DegradationStep[]=['reduce-reflections','reduce-volumetrics','reduce-shadow-distance','reduce-render-scale','reduce-particles','reduce-geometry','reduce-animation'];
  private level=0;
  increase():DegradationStep|undefined{return this.order[Math.min(this.level++,this.order.length-1)];}
  recover():DegradationStep|undefined{if(this.level<=0)return;this.level--;return this.order[this.level];}
  get currentLevel():number{return this.level;}
}
