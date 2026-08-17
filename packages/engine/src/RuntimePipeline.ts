import{FixedStepClock}from'@raven/core';import{WebGLSceneRenderer,type SceneRenderStats}from'@raven/renderer';import{extractPbrScene,type RavenScene}from'./Scene';import{TransformSystem}from'./TransformSystem';
export interface RuntimePipelineOptions{simulationHz?:number;onFixedStep?:(dt:number)=>void;}
export class RuntimePipeline{
  readonly transforms=new TransformSystem();readonly sceneRenderer:WebGLSceneRenderer;readonly fixed:FixedStepClock;
  constructor(readonly scene:RavenScene,canvas:HTMLCanvasElement,readonly options:RuntimePipelineOptions={}){const gl=canvas.getContext('webgl2');if(!gl)throw new Error('RAVEN requires WebGL2');this.sceneRenderer=new WebGLSceneRenderer(gl,canvas);this.fixed=new FixedStepClock(1000/(options.simulationHz??60));}
  frame(cameraEntity:number,deltaMs:number,cssWidth:number,cssHeight:number,dpr:number):SceneRenderStats{this.fixed.advance(deltaMs,dt=>this.options.onFixedStep?.(dt));this.transforms.update(this.scene);const extracted=extractPbrScene(this.scene,cameraEntity);return this.sceneRenderer.render({camera:extracted.camera,draws:extracted.draws,cssWidth,cssHeight,devicePixelRatio:dpr,frameMs:deltaMs});}
  dispose():void{this.sceneRenderer.dispose();}
}
