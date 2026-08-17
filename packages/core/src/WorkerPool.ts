import { WorkerClient, type WorkerRequest } from './WorkerProtocol';
export class WorkerPool {
  private workers:WorkerClient[]=[];private cursor=0;
  constructor(url:URL,count=Math.max(1,Math.min(4,(navigator.hardwareConcurrency||4)-1))){for(let i=0;i<count;i++)this.workers.push(new WorkerClient(new Worker(url,{type:'module',name:`raven-worker-${i}`})));}
  request<T>(kind:WorkerRequest['kind'],payload:unknown,transfer:Transferable[]=[]):Promise<T>{const worker=this.workers[this.cursor++%this.workers.length];return worker.request<T>(kind,payload,transfer);}
  dispose():void{for(const w of this.workers)w.worker.terminate();this.workers=[];}
}
