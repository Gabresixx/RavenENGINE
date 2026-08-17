import{readdir,readFile,stat}from'node:fs/promises';import{join,relative,sep}from'node:path';
const root=process.cwd(),packagesDir=join(root,'packages');
const failures=[],files=[],ignored=new Set(['node_modules','dist','.git','.turbo','.cache','coverage']);
async function walk(dir){for(const name of await readdir(dir)){if(ignored.has(name))continue;const path=join(dir,name),s=await stat(path);if(s.isDirectory())await walk(path);else if(/\.(ts|tsx|js|mjs)$/.test(name))files.push(path);}}
await walk(packagesDir);
const lowLayerRules={platform:new Set(),math:new Set(),serialization:new Set(['platform']),core:new Set(['platform','serialization'])};
const domain=/\b(TLOU|RDR2|Seattle|infected|survivor|The Last of Us|Red Dead Redemption)\b/i;
const coreBrowserGlobals=/\b(requestAnimationFrame|cancelAnimationFrame|performance|indexedDB|localStorage|sessionStorage|navigator|new\s+Worker)\b/;
for(const path of files){
  const rel=relative(root,path).split(sep).join('/'),text=await readFile(path,'utf8'),pkg=rel.split('/')[1];
  if(domain.test(text))failures.push(`${rel}: game-specific domain term leaked into engine package`);
  if(/\bMath\.random\s*\(/.test(text))failures.push(`${rel}: Math.random is forbidden; use deterministic RNG`);
  if(pkg==='core'&&coreBrowserGlobals.test(text))failures.push(`${rel}: browser/time global leaked into core`);
  const allowed=lowLayerRules[pkg];
  if(allowed){for(const match of text.matchAll(/@raven\/([a-z0-9-]+)/g)){const target=match[1];if(target!==pkg&&!allowed.has(target))failures.push(`${rel}: low-layer package ${pkg} cannot reference @raven/${target}`);}}
}
const required=[
  'packages/platform/src/Platform.ts','packages/serialization/src/Snapshot.ts','packages/core/src/ModuleGraph.ts','packages/core/src/HandlePool.ts','packages/core/src/ResourceManager.ts','packages/core/src/Cancellation.ts','packages/core/src/Backend.ts','packages/core/src/EngineConfig.ts','docs/ENGINE_FOUNDATION_CHECKLIST.md','docs/ENGINE_IDENTITY.md','docs/adr/0005-platform-and-lifecycle.md','docs/adr/0006-versioned-serialization.md','docs/adr/0007-backends-jobs-and-resource-ownership.md','docs/adr/0008-engine-scope-and-generalization.md','docs/adr/0009-foundation-gates.md'
];
for(const rel of required)try{await stat(join(root,rel));}catch{failures.push(`${rel}: required foundation artifact missing`);}
if(failures.length){console.error('RAVEN foundation verification failed:\n'+[...new Set(failures)].map(x=>` - ${x}`).join('\n'));process.exit(1);}
console.log(`RAVEN foundation invariants OK (${files.length} source files scanned).`);
