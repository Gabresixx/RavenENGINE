import { RavenEngine } from '@raven/core';
import { RavenRenderer, type ScenePacket } from '@raven/renderer';
import { QualityGovernor } from '@raven/quality';

const host=document.querySelector<HTMLDivElement>('#app')!;
const canvas=document.createElement('canvas'); host.appendChild(canvas);
const renderer=new RavenRenderer(canvas);
const engine=new RavenEngine();
const quality=new QualityGovernor();
const emptyScene:ScenePacket={opaque:[],transparent:[],lights:[]};

engine.scheduler.register({id:'render',cadenceHz:60,priority:100,estimatedCostMs:0.2,run:frame=>{
  const rect=canvas.getBoundingClientRect();
  quality.update(engine.telemetry.current.frameMs,engine.telemetry.current.cpuSimulationMs);
  renderer.render({cssWidth:rect.width,cssHeight:rect.height,devicePixelRatio:Math.min(devicePixelRatio,2),frameMs:frame.realDeltaMs,scene:emptyScene});
  engine.telemetry.current.renderScale=renderer.dynamicResolution.scale;
}});
engine.start();
