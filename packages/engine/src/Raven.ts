import{RavenEngine,Diagnostics,FrameGovernor}from'@raven/core';import{RavenRenderer}from'@raven/renderer';import{AssetCompiler}from'@raven/assets';import{StreamingManager,AtmosphereFields,WorldDeltaStore}from'@raven/world';import{QualityGovernor,BudgetWatchdog}from'@raven/quality';import{RavenScene}from'./Scene';import{RuntimePipeline,type RuntimePipelineOptions}from'./RuntimePipeline';
export interface RavenConfig{canvas:HTMLCanvasElement;targetFps?:30|60;assetCacheBytes?:number;pipeline?:RuntimePipelineOptions;}
export class Raven{
  readonly runtime=new RavenEngine();readonly renderer:RavenRenderer;readonly assets=new AssetCompiler();readonly streaming=new StreamingManager();readonly atmosphere=new AtmosphereFields();readonly persistence=new WorldDeltaStore();readonly diagnostics=new Diagnostics();readonly frameGovernor=new FrameGovernor();readonly quality:QualityGovernor;readonly watchdog=new BudgetWatchdog();readonly scene=new RavenScene();readonly pipeline:RuntimePipeline;
  constructor(readonly config:RavenConfig){this.renderer=new RavenRenderer(config.canvas);this.quality=new QualityGovernor(1000/(config.targetFps??60));this.pipeline=new RuntimePipeline(this.scene,config.canvas,config.pipeline);}
  start():void{this.runtime.start();}stop():void{this.runtime.stop();}dispose():void{this.stop();this.pipeline.dispose();}
}
