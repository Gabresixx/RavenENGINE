import { Raven, type ScenePacket } from '@raven/engine';
const host=document.querySelector<HTMLDivElement>('#app')!;const canvas=document.createElement('canvas');host.appendChild(canvas);
const raven=new Raven({canvas,targetFps:60});const emptyScene:ScenePacket={opaque:[],transparent:[],lights:[]};
raven.runtime.scheduler.register({id:'render',cadenceHz:60,priority:100,estimatedCostMs:0.2,run:frame=>{const rect=canvas.getBoundingClientRect();raven.quality.update(frame.realDeltaMs,raven.runtime.telemetry.current.cpuSimulationMs);raven.renderer.render({cssWidth:rect.width,cssHeight:rect.height,devicePixelRatio:Math.min(devicePixelRatio,2),frameMs:frame.realDeltaMs,scene:emptyScene});raven.runtime.telemetry.current.renderScale=raven.renderer.dynamicResolution.scale;}});
raven.start();
