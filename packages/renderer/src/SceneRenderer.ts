import{PbrPass,type PbrCameraPacket,type PbrDrawPacket}from'./PbrPass';import{GpuTimer}from'./GpuTimer';import{DynamicResolutionController}from'./DynamicResolution';
export interface SceneRenderInput{camera:PbrCameraPacket;draws:readonly PbrDrawPacket[];cssWidth:number;cssHeight:number;devicePixelRatio:number;frameMs:number;}
export interface SceneRenderStats{gpuMs?:number;renderScale:number;drawCalls:number;triangles:number;width:number;height:number;}
export class WebGLSceneRenderer{
  readonly pbr:PbrPass;readonly gpuTimer:GpuTimer;readonly dynamicResolution=new DynamicResolutionController();
  constructor(readonly gl:WebGL2RenderingContext,readonly canvas:HTMLCanvasElement){this.pbr=new PbrPass(gl);this.gpuTimer=new GpuTimer(gl);}
  render(input:SceneRenderInput):SceneRenderStats{const scale=this.dynamicResolution.update(input.frameMs),width=Math.max(1,Math.floor(input.cssWidth*input.devicePixelRatio*scale)),height=Math.max(1,Math.floor(input.cssHeight*input.devicePixelRatio*scale));if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}this.gl.viewport(0,0,width,height);this.gl.clearColor(.018,.022,.026,1);this.gl.clearDepth(1);this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);this.gpuTimer.begin();this.pbr.draw(input.camera,input.draws);this.gpuTimer.end();let triangles=0;for(const d of input.draws)triangles+=Math.floor(d.indexCount/3);return{gpuMs:this.gpuTimer.poll(),renderScale:scale,drawCalls:input.draws.length,triangles,width,height};}
  dispose():void{this.pbr.dispose();}
}
