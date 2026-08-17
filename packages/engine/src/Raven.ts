import { RavenEngine, Diagnostics, FrameGovernor } from '@raven/core';
import { RavenRenderer } from '@raven/renderer';
import { AssetCompiler } from '@raven/assets';
import { StreamingManager, AtmosphereFields, WorldDeltaStore } from '@raven/world';
import { QualityGovernor, BudgetWatchdog } from '@raven/quality';

export interface RavenConfig { canvas:HTMLCanvasElement; targetFps?:30|60; assetCacheBytes?:number; }

export class Raven {
  readonly runtime=new RavenEngine();
  readonly renderer:RavenRenderer;
  readonly assets=new AssetCompiler();
  readonly streaming=new StreamingManager();
  readonly atmosphere=new AtmosphereFields();
  readonly persistence=new WorldDeltaStore();
  readonly diagnostics=new Diagnostics();
  readonly frameGovernor=new FrameGovernor();
  readonly quality:QualityGovernor;
  readonly watchdog=new BudgetWatchdog();

  constructor(readonly config:RavenConfig){
    this.renderer=new RavenRenderer(config.canvas);
    this.quality=new QualityGovernor(1000/(config.targetFps??60));
  }

  start():void{this.runtime.start();}
  stop():void{this.runtime.stop();}
}
