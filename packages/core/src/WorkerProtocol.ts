export type WorkerRequest = { id:number; kind:'compile-asset'|'compile-texture'|'generate-sector'; payload:unknown };
export type WorkerResponse = { id:number; ok:true; payload:unknown } | { id:number; ok:false; error:string };

export class WorkerClient {
  private nextId=1;
  private pending=new Map<number,{resolve:(v:unknown)=>void;reject:(e:unknown)=>void}>();
  constructor(readonly worker:Worker){ worker.onmessage=e=>this.receive(e.data as WorkerResponse); }
  request<T>(kind:WorkerRequest['kind'],payload:unknown,transfer:Transferable[]=[]):Promise<T>{
    const id=this.nextId++;
    return new Promise<T>((resolve,reject)=>{this.pending.set(id,{resolve:v=>resolve(v as T),reject});this.worker.postMessage({id,kind,payload} satisfies WorkerRequest,transfer);});
  }
  private receive(msg:WorkerResponse){const p=this.pending.get(msg.id);if(!p)return;this.pending.delete(msg.id);msg.ok?p.resolve(msg.payload):p.reject(new Error(msg.error));}
}
