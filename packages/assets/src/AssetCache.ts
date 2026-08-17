import type { BakedAsset } from './types';

interface Entry { asset: BakedAsset; refs: number; touched: number; }

export class AssetCache {
  private entries = new Map<string, Entry>();
  constructor(readonly maxBytes = 256 * 1024 * 1024) {}

  acquire(key:string): BakedAsset | undefined {
    const e = this.entries.get(key); if (!e) return;
    e.refs++; e.touched = performance.now(); return e.asset;
  }

  put(asset:BakedAsset): void {
    this.entries.set(asset.key,{asset,refs:0,touched:performance.now()});
    this.evict();
  }

  release(key:string): void { const e=this.entries.get(key); if(e) e.refs=Math.max(0,e.refs-1); }

  private evict(): void {
    let bytes = [...this.entries.values()].reduce((s,e)=>s+e.asset.byteSize,0);
    if (bytes <= this.maxBytes) return;
    const candidates=[...this.entries.entries()].filter(([,e])=>e.refs===0).sort((a,b)=>a[1].touched-b[1].touched);
    for(const [key,e] of candidates){ this.entries.delete(key); bytes-=e.asset.byteSize; if(bytes<=this.maxBytes) break; }
  }
}
