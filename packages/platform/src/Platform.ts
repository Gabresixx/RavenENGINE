export type FrameHandle = number;
export interface FrameHost { now(): number; requestFrame(cb:(now:number)=>void):FrameHandle; cancelFrame(handle:FrameHandle):void; queueMicrotask(cb:()=>void):void; }
export interface KeyValueStore { get(key:string):Promise<Uint8Array|undefined>; set(key:string,value:Uint8Array):Promise<void>; delete(key:string):Promise<void>; clear():Promise<void>; }
export interface WorkerPort { postMessage(message:unknown,transfer?:Transferable[]):void; terminate():void; onmessage:((event:MessageEvent)=>void)|null; onerror:((event:ErrorEvent)=>void)|null; }
export interface WorkerFactory { create(url:URL,options?:WorkerOptions):WorkerPort; }
export interface PlatformInfo { readonly name:string; readonly userAgent:string; readonly hardwareConcurrency:number; readonly deviceMemoryGiB?:number; }
export interface RavenPlatform { readonly frame:FrameHost; readonly storage:KeyValueStore; readonly workers:WorkerFactory; readonly info:PlatformInfo; }
