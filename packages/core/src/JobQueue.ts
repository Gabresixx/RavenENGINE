export interface BudgetedJob<T=unknown> { id:string; priority:number; estimatedCostMs:number; run(signal:AbortSignal):Promise<T>|T; }

export class JobQueue {
  private queue:BudgetedJob[]=[];
  enqueue(job:BudgetedJob):void{this.queue.push(job);this.queue.sort((a,b)=>b.priority-a.priority);}
  get length():number{return this.queue.length;}

  async drainBudget(budgetMs:number,signal=new AbortController().signal):Promise<number>{
    const start=performance.now(); let completed=0;
    while(this.queue.length){
      const next=this.queue[0];
      if(performance.now()-start+next.estimatedCostMs>budgetMs)break;
      this.queue.shift(); await next.run(signal); completed++;
    }
    return completed;
  }
}
