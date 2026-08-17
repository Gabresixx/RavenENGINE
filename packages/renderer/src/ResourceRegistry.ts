export interface DisposableGpuResource { dispose(): void; }

export class ResourceRegistry {
  private resources = new Set<DisposableGpuResource>();
  track<T extends DisposableGpuResource>(resource:T):T{ this.resources.add(resource); return resource; }
  release(resource:DisposableGpuResource):void{ if(this.resources.delete(resource)) resource.dispose(); }
  disposeAll():void{ for(const r of this.resources) r.dispose(); this.resources.clear(); }
  get count():number{return this.resources.size;}
}
