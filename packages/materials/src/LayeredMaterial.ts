export interface MaterialLayer {
  id:string;
  graph:string;
  mask:'always'|'up-facing'|'down-facing'|'moisture'|'damage'|'edge'|'cavity'|'custom';
  opacity:number;
}

export interface LayeredMaterialDefinition {
  id:string;
  base:MaterialLayer;
  layers:readonly MaterialLayer[];
  physical:{porosity:number;absorbency:number;hardness:number;friction:number;metallic:number;};
}
