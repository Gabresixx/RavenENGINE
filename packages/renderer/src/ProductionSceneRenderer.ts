import{PbrPass,type PbrCameraPacket,type PbrDrawPacket}from'./PbrPass';
import{GpuTimer}from'./GpuTimer';
import{DynamicResolutionController}from'./DynamicResolution';
import{SceneTargets}from'./SceneTargets';
import{DepthPrepass}from'./DepthPrepass';
import{ScreenSpaceAoPass}from'./ScreenSpaceAoPass';
import{PostProcessPass}from'./PostProcessPass';
import{FrameGraph}from'./FrameGraph';
import{probeCapabilities,type RendererCapabilities}from'./Capabilities';
import{PassBudgetController}from'./PassBudget';
import{resolveProductionQuality,type ProductionQualityState}from'./ProductionQuality';

export interface ProductionRenderInput{camera:PbrCameraPacket;draws:readonly PbrDrawPacket[];cssWidth:number;cssHeight:number;devicePixelRatio:number;frameMs:number;aoScale?:number;exposure?:number;}
export interface ProductionRenderStats{gpuMs?:number;gpuPasses:Readonly<Record<string,number>>;renderScale:number;drawCalls:number;triangles:number;width:number;height:number;hdr:boolean;qualityPressure:number;}
interface ProductionFrame{input:ProductionRenderInput;width:number;height:number;aoWidth:number;aoHeight:number;quality:ProductionQualityState;}

export class ProductionSceneRenderer{
  readonly capabilities:RendererCapabilities;
  readonly dynamicResolution=new DynamicResolutionController();
  readonly timer:GpuTimer;
  readonly budgets=new PassBudgetController();
  readonly graph=new FrameGraph();
  readonly targets:SceneTargets;
  readonly depth:DepthPrepass;
  readonly pbr:PbrPass;
  readonly ao:ScreenSpaceAoPass;
  readonly post:PostProcessPass;
  private frameNumber=0;
  private current?:ProductionFrame;
  private resources=new Map<string,unknown>();

  constructor(readonly gl:WebGL2RenderingContext,readonly canvas:HTMLCanvasElement){
    gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
    this.capabilities=probeCapabilities(gl);this.timer=new GpuTimer(gl);this.targets=new SceneTargets(gl,this.capabilities);this.depth=new DepthPrepass(gl);this.pbr=new PbrPass(gl);this.ao=new ScreenSpaceAoPass(gl);this.post=new PostProcessPass(gl);
    this.budgets.register({name:'depth',scale:1,maxMs:2,enabled:true,minScale:1}).register({name:'opaque',scale:1,maxMs:6,enabled:true,minScale:1}).register({name:'ao',scale:1,maxMs:1.8,enabled:true,minScale:.5,degradationRate:.1}).register({name:'present',scale:1,maxMs:1.2,enabled:true,minScale:1});
    this.graph.declare({name:'sceneDepth',kind:'texture',transient:false}).declare({name:'sceneColor',kind:'texture',transient:false}).declare({name:'ao',kind:'texture',transient:false}).declare({name:'backbuffer',kind:'external',transient:false});
    this.graph.add({name:'depth',reads:[],writes:['sceneDepth'],execute:()=>this.runDepth()});
    this.graph.add({name:'opaque',reads:['sceneDepth'],writes:['sceneColor'],execute:()=>this.runOpaque()});
    this.graph.add({name:'ao',reads:['sceneDepth'],writes:['ao'],execute:()=>this.runAo()});
    this.graph.add({name:'present',reads:['sceneColor','ao'],writes:['backbuffer'],execute:()=>this.runPresent()});
    this.graph.compilePlan();
  }

  render(i:ProductionRenderInput):ProductionRenderStats{
    if(i.cssWidth<=0||i.cssHeight<=0||i.devicePixelRatio<=0)throw new RangeError('Production render dimensions and DPR must be positive');
    const gpuPasses=this.timer.pollResults();this.budgets.observeAll(gpuPasses);let gpuFrameMs=0;for(const name of ['depth','opaque','ao','present'])gpuFrameMs+=gpuPasses[name]??0;
    const scale=this.dynamicResolution.update(i.frameMs,gpuFrameMs||undefined),width=Math.max(1,Math.floor(i.cssWidth*i.devicePixelRatio*scale)),height=Math.max(1,Math.floor(i.cssHeight*i.devicePixelRatio*scale));
    const budgetPressure=this.budgets.pressure(),quality=resolveProductionQuality(Math.max(0,Math.min(1,(budgetPressure-.72)/.78))),aoBudget=this.budgets.passes.get('ao')?.scale??1,aoScale=Math.max(.25,Math.min(1,(i.aoScale??.5)*quality.aoScale*aoBudget)),aw=Math.max(1,Math.floor(width*aoScale)),ah=Math.max(1,Math.floor(height*aoScale));
    if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
    this.targets.ensure(width,height);this.ao.ensure(aw,ah);
    this.resources.set('sceneDepth',this.targets.depth);this.resources.set('sceneColor',this.targets.color);this.resources.set('ao',this.ao.texture);this.resources.set('backbuffer',null);
    this.current={input:i,width,height,aoWidth:aw,aoHeight:ah,quality};
    this.graph.execute({gl:this.gl,resources:this.resources,width,height,frame:this.frameNumber++});
    this.current=undefined;
    let triangles=0;for(const d of i.draws)triangles+=Math.floor(d.indexCount/3);
    return{gpuMs:gpuFrameMs||undefined,gpuPasses:{...gpuPasses},renderScale:scale,drawCalls:i.draws.length*2+2,triangles:triangles*2,width,height,hdr:this.targets.hdr,qualityPressure:quality.pressure};
  }

  private requireFrame():ProductionFrame{if(!this.current)throw new Error('Production renderer pass executed outside a frame');return this.current;}
  private runDepth():void{const f=this.requireFrame(),g=this.gl;this.timer.begin('depth');g.bindFramebuffer(g.FRAMEBUFFER,this.targets.framebuffer);g.viewport(0,0,f.width,f.height);this.depth.draw(f.input.camera,f.input.draws);this.timer.end();}
  private runOpaque():void{const f=this.requireFrame(),g=this.gl;this.timer.begin('opaque');g.bindFramebuffer(g.FRAMEBUFFER,this.targets.framebuffer);g.viewport(0,0,f.width,f.height);g.clearColor(.018,.022,.026,1);g.clear(g.COLOR_BUFFER_BIT);g.depthFunc(g.LEQUAL);g.depthMask(false);this.pbr.draw(f.input.camera,f.input.draws);g.depthMask(true);g.depthFunc(g.LESS);g.bindFramebuffer(g.FRAMEBUFFER,null);this.timer.end();}
  private runAo():void{const f=this.requireFrame();this.timer.begin('ao');this.ao.render(this.targets.depth,f.width,f.height,3);this.timer.end();}
  private runPresent():void{const f=this.requireFrame();this.timer.begin('present');this.post.render(this.targets.color,this.ao.texture,f.width,f.height,f.input.exposure??0);this.timer.end();}

  dispose():void{this.timer.dispose();this.depth.dispose();this.pbr.dispose();this.ao.dispose();this.post.dispose();this.targets.dispose();this.resources.clear();}
}
