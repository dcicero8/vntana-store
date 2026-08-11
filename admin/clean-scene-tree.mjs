#!/usr/bin/env node
// Usage:
//   node clean-scene-tree.mjs /path/to/file.glb          (local file)
//   node clean-scene-tree.mjs <token-or-password>         (download from VNTANA)

import { writeFileSync, readFileSync, existsSync } from 'fs';

const EMAIL        = 'dcicero8@gmail.com';
const PRODUCT_UUID = '49da613e-dcc9-4351-b7d4-20ed896a711a';
const CLIENT_UUID  = 'b577b1c8-80bd-4dab-b1b1-b22f9de4671a';
const ARG          = process.argv[2];

if (!ARG) {
  console.error('Usage: node clean-scene-tree.mjs <local-glb-path | token-or-password>');
  process.exit(1);
}

let buf;

if (ARG.endsWith('.glb') || existsSync(ARG)) {
  // ── Local file ──────────────────────────────────────────────────────────────
  console.log(`Reading local file: ${ARG}`);
  buf = readFileSync(ARG);
  console.log(`Read ${(buf.length / 1024 / 1024).toFixed(1)} MB`);
} else {
  // ── Download from VNTANA ────────────────────────────────────────────────────
  let token;
  if (ARG.length > 60 && ARG.includes('/')) {
    console.log('Using provided auth token directly.');
    token = ARG;
  } else {
    console.log('Authenticating with password...');
    const authResp = await fetch('https://api-platform.vntana.com/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: ARG }),
    });
    const authData = await authResp.json();
    token = authData?.response?.token;
    if (!token) { console.error('Auth failed:', authData); process.exit(1); }
    console.log('Authenticated.');
  }

  console.log('Fetching product...');
  const prodResp = await fetch(
    `https://api-platform.vntana.com/v1/products/${PRODUCT_UUID}?clientUuid=${CLIENT_UUID}`,
    { headers: { 'X-AUTH-TOKEN': token } }
  );
  const prodData = await prodResp.json();
  const product = prodData?.response;
  const blobId = product?.asset?.models?.[0]?.modelBlobId ?? product?.asset?.assetBlobId;
  const productName = product?.name ?? PRODUCT_UUID;
  if (!blobId) { console.error('No blobId found:', JSON.stringify(prodData).slice(0, 300)); process.exit(1); }
  console.log(`Product: ${productName}`);

  console.log('Downloading GLB...');
  const dlResp = await fetch(
    `https://api-platform.vntana.com/v1/storage/load/asset/model?blobId=${blobId}&clientUuid=${CLIENT_UUID}`,
    { headers: { 'X-AUTH-TOKEN': token } }
  );
  if (!dlResp.ok) { console.error('Download failed:', dlResp.status); process.exit(1); }
  buf = Buffer.from(await dlResp.arrayBuffer());
  console.log(`Downloaded ${(buf.length / 1024 / 1024).toFixed(1)} MB`);
}

// ── Parse GLB JSON chunk ──────────────────────────────────────────────────────
const magic = buf.readUInt32LE(0);
if (magic !== 0x46546C67) { console.error('Not a GLB file'); process.exit(1); }

const jsonChunkLength = buf.readUInt32LE(12);
const jsonChunkType   = buf.readUInt32LE(16);
if (jsonChunkType !== 0x4E4F534A) { console.error('First chunk is not JSON'); process.exit(1); }

const jsonStr = buf.slice(20, 20 + jsonChunkLength).toString('utf8').replace(/\0+$/, '');
const gltf    = JSON.parse(jsonStr);
const nodes   = gltf.nodes ?? [];

// ── Build parent map ──────────────────────────────────────────────────────────
const parentOf = new Array(nodes.length).fill(-1);
nodes.forEach((node, i) => {
  (node.children ?? []).forEach(ci => { parentOf[ci] = i; });
});

// SolidWorks feature/operation names that are NOT real BOM part names
const CAD_OP = /^(Fillet|Boss-|Cut-|Revolve|Sweep|Mirror|LPattern|CirPattern|Chamfer|Shell|Rib|Draft|Scale|Dome|Wrap|Flex|Deform|Combine|Intersect|Indent|Cavity|Extrude|Pattern|Sketch|Plane|Axis|Surface|NONE_NEW_|\d{4}[_-]\d{2}[_-]\d{2}[_-])/i;

function isRealPartName(name) {
  if (!name) return false;
  const t = name.trim();
  if (!t || t.toUpperCase() === 'NONE') return false;
  return !CAD_OP.test(t);
}

function findNamedAncestor(idx) {
  let cur = parentOf[idx];
  while (cur !== -1) {
    const name = (nodes[cur]?.name ?? '').trim();
    if (isRealPartName(name)) return { name, ancestorIdx: cur };
    cur = parentOf[cur];
  }
  return null;
}

// Hardware keyword detection for BOM grouping
const HARDWARE_KW = /\b(bolt|screw|nut|washer|rivet|pin|stud|fastener|anchor|clamp|clip|bracket|bushing|grommet|standoff|spacer|cap screw|hex cap|socket head|flat head|button head|set screw|lock nut|lock washer|split ring|retaining ring|snap ring|cotter|dowel|thread|threaded)\b/i;

function isHardware(name) {
  return HARDWARE_KW.test(name);
}

// ── Pass 1: Rename unnamed GROUP nodes (no mesh) ──────────────────────────────
let groupRenamed = 0;
nodes.forEach((node, i) => {
  if (node.mesh !== undefined) return;
  if (isRealPartName(node.name)) return;
  const found = findNamedAncestor(i);
  if (found) { nodes[i].name = found.name; groupRenamed++; }
});

// ── Pass 2: Rename NONE mesh nodes, numbered per ancestor ────────────────────
const changes = [];

nodes.forEach((node, i) => {
  if (node.mesh === undefined) return;
  if (isRealPartName(node.name)) return;

  const found = findNamedAncestor(i);
  if (!found) return;

  // All instances share the same name — no _N suffix, cleaner tree
  const newName = found.name;
  changes.push({ nodeIndex: i, from: (node.name ?? 'NONE'), to: newName, partName: found.name });
  nodes[i].name = newName;
});

// ── BOM Summary ───────────────────────────────────────────────────────────────
const meshNodes = nodes.filter(n => n.mesh !== undefined);
const partCounts = {};
const partIsHardware = {};

for (const c of changes) {
  partCounts[c.partName] = (partCounts[c.partName] ?? 0) + 1;
  if (isHardware(c.partName)) partIsHardware[c.partName] = true;
}

// Also count mesh nodes that already had real names
for (const node of meshNodes) {
  const name = (node.name ?? '').trim();
  // Strip trailing _N to get base part name
  const base = name.replace(/_\d+$/, '');
  if (isRealPartName(base) && !changes.find(c => c.nodeIndex === nodes.indexOf(node))) {
    partCounts[base] = (partCounts[base] ?? 0) + 1;
    if (isHardware(base)) partIsHardware[base] = true;
  }
}

const hardware = Object.entries(partCounts).filter(([n]) => partIsHardware[n]).sort((a,b) => b[1]-a[1]);
const structural = Object.entries(partCounts).filter(([n]) => !partIsHardware[n]).sort((a,b) => b[1]-a[1]);

console.log(`\nTotal mesh nodes : ${meshNodes.length}`);
console.log(`Renamed (pass 1) : ${groupRenamed} group nodes`);
console.log(`Renamed (pass 2) : ${changes.length} mesh nodes`);
console.log(`Unique parts     : ${Object.keys(partCounts).length}`);

console.log('\n── STRUCTURAL PARTS ─────────────────────────────────────────────');
for (const [name, count] of structural) {
  console.log(`  ${String(count).padStart(4)}x  ${name}`);
}

if (hardware.length) {
  console.log('\n── HARDWARE / FASTENERS ─────────────────────────────────────────');
  for (const [name, count] of hardware) {
    console.log(`  ${String(count).padStart(4)}x  ${name}`);
  }
}

// Warn about any nodes still unnamed after both passes
const stillUnnamed = meshNodes.filter(n => !isRealPartName(n.name));
if (stillUnnamed.length) {
  console.log(`\n⚠  ${stillUnnamed.length} mesh nodes still have no real part name (no named ancestor found)`);
  for (const n of stillUnnamed.slice(0, 10)) {
    console.log(`    "${n.name ?? 'NONE'}"`);
  }
}

// ── Write cleaned GLB ─────────────────────────────────────────────────────────
const newJsonStr = JSON.stringify(gltf);
const padLen     = (4 - (newJsonStr.length % 4)) % 4;
const paddedJson = newJsonStr + ' '.repeat(padLen);
const newJsonBuf = Buffer.from(paddedJson, 'utf8');

const binaryChunkOffset = 20 + jsonChunkLength;
const binaryChunkBuf    = binaryChunkOffset < buf.length ? buf.slice(binaryChunkOffset) : Buffer.alloc(0);

const newJsonChunkHeader = Buffer.alloc(8);
newJsonChunkHeader.writeUInt32LE(newJsonBuf.length, 0);
newJsonChunkHeader.writeUInt32LE(0x4E4F534A, 4);

const newTotalLength = 12 + 8 + newJsonBuf.length + binaryChunkBuf.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546C67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(newTotalLength, 8);

const newGlb = Buffer.concat([header, newJsonChunkHeader, newJsonBuf, binaryChunkBuf]);
const outPath = `/Users/derekcicero/Downloads/roeslein-cleaned-v4.glb`;
writeFileSync(outPath, newGlb);
console.log(`\nCleaned GLB written to: ${outPath}`);
console.log(`Size: ${(newGlb.length / 1024 / 1024).toFixed(1)} MB (original: ${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
