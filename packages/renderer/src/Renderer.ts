import { WebGL2Device } from './Device';
import { RenderGraph } from './RenderGraph';
import { DynamicResolutionController } from './DynamicResolution';
import type { ScenePacket } from './ScenePacket';

export interface RendererFrameInput { cssWidth:number; cssHeight:number; devicePixelRatio:number; frameMs:number; scene:ScenePacket; }

export class RavenRenderer {
  readonly device:WebGL2Device;
  readonly graph=new RenderGraph();
  readonly dynamicResolution=new DynamicResolutionController();

  constructor(canvas:HTMLCanvasElement){
    this.device=new WebGL2Device(canvas);
    this.graph.add({name:'clear',execute:({gl})=>{gl.clearColor(0.018,0.022,0.026,1);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);}});
  }

  render(input:RendererFrameInput):void{
    const scale=this.dynamicResolution.update(input.frameMs);
    const width=Math.max(1,Math.floor(input.cssWidth*input.devicePixelRatio*scale));
    const height=Math.max(1,Math.floor(input.cssHeight*input.devicePixelRatio*scale));
    this.device.resize(width,height);
    this.graph.execute({gl:this.device.gl,width,height});
  }
}
