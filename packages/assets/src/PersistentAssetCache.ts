import type { BakedAsset } from './types';
export class PersistentAssetCache {
  private db?:IDBDatabase;
  constructor(readonly dbName='raven-assets-v1'){}
  async open():Promise<void>{if(this.db)return;this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open(this.dbName,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('assets'))r.result.createObjectStore('assets');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async get(key:string):Promise<BakedAsset|undefined>{await this.open();return new Promise((resolve,reject)=>{const r=this.db!.transaction('assets','readonly').objectStore('assets').get(key);r.onsuccess=()=>resolve(r.result as BakedAsset|undefined);r.onerror=()=>reject(r.error);});}
  async put(asset:BakedAsset):Promise<void>{await this.open();await new Promise<void>((resolve,reject)=>{const r=this.db!.transaction('assets','readwrite').objectStore('assets').put(asset,asset.key);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});}
  async remove(key:string):Promise<void>{await this.open();await new Promise<void>((resolve,reject)=>{const r=this.db!.transaction('assets','readwrite').objectStore('assets').delete(key);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});}
}
