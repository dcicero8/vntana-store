// Redact (physically remove) parts from a VNTANA GLB and drop a neutral placeholder
// box in each removed part's footprint. Re-exports RAW (no Draco) so VNTANA's
// "Convert Only" pipeline accepts it. The removed geometry is dropped from the
// binary (not just hidden) — safe for proprietary parts on public embeds.
//
// Setup (in this dir):
//   npm i @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions \
//         draco3dgltf gltf-validator
// Usage:
//   node redact-part.mjs <input.glb> <output.glb> <partMatch1> [partMatch2 ...]
//   (partMatch = substring of the node name, e.g. a part number "15000020584")
//
// After it writes: upload to VNTANA and process with the **Convert Only** pipeline
// (the optimization pipelines fail on edited GLBs). Verify the target parts are gone
// and extensionsUsed has no KHR_draco_mesh_compression.

import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const [IN, OUT, ...MATCHES] = process.argv.slice(2);
if (!IN || !OUT || !MATCHES.length) {
  console.error('usage: node redact-part.mjs <in.glb> <out.glb> <partMatch...>');
  process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});
const doc = await io.read(IN);
const root = doc.getRoot();
const buf = root.listBuffers()[0];
const scene = root.listScenes()[0];

const BOX_FACES = [[0,1,2,3,[0,0,-1]],[5,4,7,6,[0,0,1]],[4,0,3,7,[-1,0,0]],
                   [1,5,6,2,[1,0,0]],[3,2,6,7,[0,1,0]],[4,5,1,0,[0,-1,0]]];

function addPlaceholder(min, max) {
  const c = min.map((m,i)=>(m+max[i])/2), s = max.map((m,i)=>m-min[i]);
  const [hx,hy,hz]=[s[0]/2,s[1]/2,s[2]/2], [cx,cy,cz]=c;
  const cor=[[cx-hx,cy-hy,cz-hz],[cx+hx,cy-hy,cz-hz],[cx+hx,cy+hy,cz-hz],[cx-hx,cy+hy,cz-hz],
             [cx-hx,cy-hy,cz+hz],[cx+hx,cy-hy,cz+hz],[cx+hx,cy+hy,cz+hz],[cx-hx,cy+hy,cz+hz]];
  const pos=[],nor=[],idx=[]; let vi=0;
  for (const [a,b,cc,d,n] of BOX_FACES){ for(const p of [cor[a],cor[b],cor[cc],cor[d]]){pos.push(...p);nor.push(...n);} idx.push(vi,vi+1,vi+2,vi,vi+2,vi+3); vi+=4; }
  const pa=doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buf);
  const na=doc.createAccessor().setType('VEC3').setArray(new Float32Array(nor)).setBuffer(buf);
  const ia=doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(idx)).setBuffer(buf);
  const mat=doc.createMaterial('Redacted Placeholder').setBaseColorFactor([0.55,0.55,0.58,1]).setMetallicFactor(0.1).setRoughnessFactor(0.85);
  const prim=doc.createPrimitive().setAttribute('POSITION',pa).setAttribute('NORMAL',na).setIndices(ia).setMaterial(mat);
  scene.addChild(doc.createNode('Redacted Placeholder').setMesh(doc.createMesh('Redacted Placeholder').addPrimitive(prim)));
}

for (const match of MATCHES) {
  const target = root.listNodes().find(n => (n.getName()||'').includes(match));
  if (!target) { console.error('NOT FOUND:', match); continue; }
  const bb = getBounds(target);
  const desc = []; target.traverse(n => desc.push(n));
  for (const n of desc.reverse()) n.dispose();
  addPlaceholder(bb.min, bb.max);   // comment out this line for a clean delete (no box)
  console.log('redacted:', match);
}

await doc.transform(prune());
// Export RAW (no Draco) — VNTANA re-optimizes raw input; Draco-in fails processing.
root.listExtensionsUsed().find(e => e.extensionName === 'KHR_draco_mesh_compression')?.dispose();
await io.write(OUT, doc);
console.log('wrote', OUT, '| extensionsUsed:', root.listExtensionsUsed().map(e=>e.extensionName));
