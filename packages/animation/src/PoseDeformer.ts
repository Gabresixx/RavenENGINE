export interface CorrectiveInput{bend:number;twist:number;tension:number;}
export interface CorrectiveWeights{compression:number;stretch:number;bulge:number;twistRelax:number;}
export function correctiveWeights(i:CorrectiveInput):CorrectiveWeights{const b=Math.min(1,Math.abs(i.bend)/Math.PI),t=Math.min(1,Math.abs(i.twist)/Math.PI);return{compression:b*b*.85,stretch:b*.55,bulge:Math.min(1,b*.6+i.tension*.35),twistRelax:t*.45};}
