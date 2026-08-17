import type{SurfaceRecipe}from'./TextureSynthesis';
export const concreteRecipe=(seed:number):SurfaceRecipe=>({id:'concrete',seed,baseColor:[.39,.4,.38],roughness:.86,metalness:0,macroScale:5,microScale:54,porosity:.8,stainStrength:.34});
export const asphaltRecipe=(seed:number):SurfaceRecipe=>({id:'asphalt',seed,baseColor:[.105,.11,.105],roughness:.92,metalness:0,macroScale:7,microScale:92,porosity:.48,stainStrength:.22});
export const denimRecipe=(seed:number):SurfaceRecipe=>({id:'denim',seed,baseColor:[.10,.17,.20],roughness:.78,metalness:0,macroScale:4,microScale:76,porosity:.18,stainStrength:.16,fiber:.55});
export const paintedMetalRecipe=(seed:number,color:[number,number,number]=[.22,.25,.23]):SurfaceRecipe=>({id:'painted-metal',seed,baseColor:color,roughness:.58,metalness:.16,macroScale:6,microScale:48,porosity:.06,stainStrength:.2,edgeWear:.35});
export const skinRecipe=(seed:number):SurfaceRecipe=>({id:'skin',seed,baseColor:[.48,.31,.25],roughness:.62,metalness:0,macroScale:3,microScale:115,porosity:.28,stainStrength:.035});
