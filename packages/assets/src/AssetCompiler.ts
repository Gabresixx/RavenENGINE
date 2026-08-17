import type { AssetRequest, BakedAsset } from './types';
import { AssetCache } from './AssetCache';

export interface AssetGenerator { supports(request:AssetRequest): boolean; compile(request:AssetRequest, signal?:AbortSignal): Promise<BakedAsset>; }

export class AssetCompiler {
  private generators: AssetGenerator[]=[];
  constructor(readonly cache=new AssetCache()){}

  register(generator:AssetGenerator):this{ this.generators.push(generator); return this; }

  async compile(request:AssetRequest, signal?:AbortSignal):Promise<BakedAsset>{
    const cached=this.cache.acquire(request.key); if(cached) return cached;
    const generator=this.generators.find(g=>g.supports(request));
    if(!generator) throw new Error(`No RAVEN asset generator supports ${request.kind}:${request.key}`);
    const asset=await generator.compile(request,signal);
    this.cache.put(asset); return asset;
  }
}
