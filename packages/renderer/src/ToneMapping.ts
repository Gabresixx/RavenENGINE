export const ravenToneMapGlsl=`
vec3 ravenACES(vec3 x){const float a=2.51,b=.03,c=2.43,d=.59,e=.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0);}
vec3 ravenLinearToSrgb(vec3 c){c=max(c,vec3(0.0));vec3 low=12.92*c;vec3 high=1.055*pow(c,vec3(1.0/2.4))-.055;return mix(low,high,step(vec3(.0031308),c));}
vec3 ravenGrade(vec3 c,float exposure){return ravenLinearToSrgb(ravenACES(c*exp2(exposure)));}
`;
