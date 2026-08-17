import type{WorkerRequest,WorkerResponse}from'./WorkerProtocol';
export type WorkerHandler=(payload:unknown)=>unknown|Promise<unknown>;
export interface WorkerMessageScope{addEventListener(type:'message',listener:(event:MessageEvent<WorkerRequest>)=>void):void;postMessage(message:WorkerResponse):void;}
export class WorkerHost{
  private handlers=new Map<WorkerRequest['kind'],WorkerHandler>();
  register(kind:WorkerRequest['kind'],handler:WorkerHandler):this{this.handlers.set(kind,handler);return this;}
  async handle(request:WorkerRequest):Promise<WorkerResponse>{const handler=this.handlers.get(request.kind);if(!handler)return{id:request.id,ok:false,error:`No worker handler for ${request.kind}`};try{return{id:request.id,ok:true,payload:await handler(request.payload)}}catch(error){return{id:request.id,ok:false,error:error instanceof Error?error.message:String(error)}}}
  attach(scope:WorkerMessageScope):void{scope.addEventListener('message',(event)=>{void this.handle(event.data).then(response=>scope.postMessage(response));});}
}
