export type LifecycleState='created'|'starting'|'running'|'stopping'|'stopped'|'disposing'|'disposed'|'faulted';
export interface EngineModule{readonly id:string;readonly dependencies?:readonly string[];start?():void|Promise<void>;stop?():void|Promise<void>;dispose?():void|Promise<void>;}
