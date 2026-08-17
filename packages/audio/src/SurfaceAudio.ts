export interface SurfaceSoundProfile{tag:string;gain:number;pitch:[number,number];lowpassHz?:number;}
export class SurfaceAudioLibrary{private profiles=new Map<string,SurfaceSoundProfile>();register(profile:SurfaceSoundProfile):this{this.profiles.set(profile.tag,profile);return this;}get(tag:string):SurfaceSoundProfile|undefined{return this.profiles.get(tag);}}
