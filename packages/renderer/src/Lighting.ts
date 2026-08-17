export interface DirectionalLightPacket{direction:[number,number,number];color:[number,number,number];intensity:number;castsShadow?:boolean;}
export interface LocalLightPacket{position:[number,number,number];color:[number,number,number];intensity:number;range:number;}
export interface EnvironmentLightPacket{skyColor:[number,number,number];groundColor?:[number,number,number];intensity?:number;}
