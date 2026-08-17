import type { MaterialGraph, MaterialNode } from './MaterialGraph';
import { MaterialGraphValidator } from './MaterialGraph';

export interface CompiledMaterial { glslFunctions:string; outputExpressions:Partial<Record<'baseColor'|'roughness'|'metalness'|'ao'|'height'|'wetnessMask',string>>; }

export class MaterialCompiler {
  private validator=new MaterialGraphValidator();
  compile(graph:MaterialGraph):CompiledMaterial{
    this.validator.validate(graph);const expr=new Map<string,string>();
    for(const n of graph.nodes) expr.set(n.id,this.nodeExpression(n,expr));
    const outputs:CompiledMaterial['outputExpressions']={};
    for(const [channel,id] of Object.entries(graph.outputs)) if(id) (outputs as Record<string,string>)[channel]=expr.get(id)??'0.0';
    return{glslFunctions:noiseFunction,outputExpressions:outputs};
  }
  private nodeExpression(n:MaterialNode,known:Map<string,string>):string{
    const val=(x:unknown):string=>typeof x==='number'?x.toFixed(6):typeof x==='string'?(known.get(x)??x):'0.0';
    switch(n.kind){case'constant':return val(n.inputs.value);case'add':return `(${val(n.inputs.a)}+${val(n.inputs.b)})`;case'multiply':return `(${val(n.inputs.a)}*${val(n.inputs.b)})`;case'clamp':return `clamp(${val(n.inputs.value)},0.0,1.0)`;case'noise':return `ravenNoise(vWorldPos*${val(n.inputs.scale??1)})`;default:return val(n.inputs.value??0);}
  }
}
const noiseFunction=`float ravenHash(vec3 p){p=fract(p*0.3183099+.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\nfloat ravenNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(ravenHash(i),ravenHash(i+vec3(1,0,0)),f.x),mix(ravenHash(i+vec3(0,1,0)),ravenHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(ravenHash(i+vec3(0,0,1)),ravenHash(i+vec3(1,0,1)),f.x),mix(ravenHash(i+vec3(0,1,1)),ravenHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
