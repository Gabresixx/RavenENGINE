export interface CascadeSplit{near:number;far:number;}
export function practicalCascadeSplits(near:number,far:number,count=3,lambda=.65):CascadeSplit[]{const points=[near];for(let i=1;i<count;i++){const p=i/count,log=near*Math.pow(far/near,p),uni=near+(far-near)*p;points.push(lambda*log+(1-lambda)*uni);}points.push(far);return Array.from({length:count},(_,i)=>({near:points[i],far:points[i+1]}));}
