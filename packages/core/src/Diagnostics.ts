export interface DiagnosticEvent { time:number; subsystem:string; severity:'info'|'warn'|'error'; code:string; message:string; data?:unknown; }
export class Diagnostics {
  private events:DiagnosticEvent[]=[];
  constructor(readonly capacity=512){}
  emit(event:Omit<DiagnosticEvent,'time'>):void{this.events.push({time:performance.now(),...event});if(this.events.length>this.capacity)this.events.splice(0,this.events.length-this.capacity);}
  snapshot():readonly DiagnosticEvent[]{return this.events;}
  clear():void{this.events=[];}
}
