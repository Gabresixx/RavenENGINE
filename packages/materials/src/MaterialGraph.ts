export type MaterialChannel='baseColor'|'normal'|'roughness'|'metalness'|'ao'|'height'|'wetnessMask';
export type MaterialNodeKind='constant'|'noise'|'voronoi'|'mix'|'multiply'|'add'|'clamp'|'curve'|'triplanar'|'stochastic-tile';

export interface MaterialNode { id:string; kind:MaterialNodeKind; inputs:Record<string,string|number|number[]>; }
export interface MaterialGraph { name:string; nodes:readonly MaterialNode[]; outputs:Partial<Record<MaterialChannel,string>>; }

export class MaterialGraphValidator {
  validate(graph:MaterialGraph):void{
    const ids=new Set(graph.nodes.map(n=>n.id));
    if(ids.size!==graph.nodes.length) throw new Error(`Material graph ${graph.name} has duplicate node ids`);
    for(const [channel,id] of Object.entries(graph.outputs)) if(id && !ids.has(id)) throw new Error(`Material output ${channel} references missing node ${id}`);
  }
}
