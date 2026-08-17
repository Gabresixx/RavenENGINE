export function checksum32(bytes:Uint8Array):number{let h=0x811c9dc5;for(const b of bytes){h^=b;h=Math.imul(h,0x01000193);}return h>>>0;}
