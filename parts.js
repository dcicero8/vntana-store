import { BASE_URL } from "./products.js";

// ── Asset config ─────────────────────────────────────────────
const UUID      = "209dc3ab-e55d-4350-b758-da7503b70f65";
const ORG       = "DCicero";
const WORKSPACE = "figurement";

// ── DOM refs ─────────────────────────────────────────────────
const viewer       = document.querySelector("vntana-viewer");
const assemblyName = document.getElementById("assembly-name");
const partDefault  = document.getElementById("part-default");
const partSelected = document.getElementById("part-selected");
const partNameEl   = document.getElementById("part-name");
const partNumberEl = document.getElementById("part-number");
const partDescEl   = document.getElementById("part-description");
const partAvailEl  = document.getElementById("part-availability");
const partLeadEl   = document.getElementById("part-lead-time");
const partPriceEl  = document.getElementById("part-price");

// ── Quantity control ─────────────────────────────────────────
let qty = 1;
document.getElementById("qty-minus").addEventListener("click", () => {
  if (qty > 1) { qty--; document.getElementById("qty-value").textContent = qty; }
});
document.getElementById("qty-plus").addEventListener("click", () => {
  qty++; document.getElementById("qty-value").textContent = qty;
});

const showPart = (num) => {

  qty = 1;
  document.getElementById("qty-value").textContent = "1";

  partNameEl.textContent   = `Part #${num}`;
  partNumberEl.textContent = `SKU-${String(num).padStart(3, "0")}`;
  partDescEl.textContent   =
    `Replacement component for the 3-Layer Die Head 110mm Assembly. ` +
    `Compatible with all Ø110mm configurations. OEM specification.`;
  partAvailEl.textContent  = "In Stock";
  partLeadEl.textContent   = "Ships in 1–2 days";
  partPriceEl.textContent  = "$5.00";

  partDefault.hidden  = true;
  partSelected.hidden = false;
};

// ── Selection detection ───────────────────────────────────────
// Two confirmed paths (from bundle source analysis):
//
// 1. Canvas click  → PointerService fires Three.js "select" on viewer.selection
//    e.intersections[0].mesh.uuid is a stable Three.js UUID per mesh.
//
// 2. Scene-graph click → viewer fires CustomEvent "scene-graph-highlight"
//    The selected row gets attribute `highlighted` (Lit ?attr binding).
//    Find it in shadow DOM and read its sibling index for the part number.

// mesh uuid → part number (assigned on first encounter, 1-based)
const meshPartMap = new Map();
let nextPartNum = 1;
let lastPartNum = null;

const handlePartNum = (num) => {
  if (num !== null && num !== lastPartNum) {
    lastPartNum = num;
    showPart(num);
  }
};

const partNumForUuid = (uuid) => {
  if (!meshPartMap.has(uuid)) meshPartMap.set(uuid, nextPartNum++);
  return meshPartMap.get(uuid);
};

// Recursively search shadow roots for the first element matching selector.
const deepQuery = (root, selector) => {
  if (!root) return null;
  const hit = root.querySelector(selector);
  if (hit) return hit;
  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) {
      const found = deepQuery(el.shadowRoot, selector);
      if (found) return found;
    }
  }
  return null;
};

// When a scene-graph row has [highlighted], find its 1-based sibling index.
const partNumFromSceneGraph = () => {
  const el = deepQuery(viewer.shadowRoot, "[highlighted]");
  if (!el) return null;
  const siblings = Array.from(el.parentElement?.children ?? []);
  const idx = siblings.indexOf(el);
  console.log("[parts] scene-graph highlighted index:", idx, el);
  return idx >= 0 ? idx + 1 : null;
};

viewer.addEventListener("load", () => {
  // Path 1: canvas click via Three.js EventDispatcher on viewer.selection
  const sel = viewer.selection;
  console.log("[parts] viewer.selection:", sel);
  if (sel?.addEventListener) {
    sel.addEventListener("select", (e) => {
      const uuid = e.intersections?.[0]?.mesh?.uuid;
      console.log("[parts] select event, mesh uuid:", uuid);
      if (uuid) handlePartNum(partNumForUuid(uuid));
    });
  }

  // Path 2: scene-graph row click fires this CustomEvent on the viewer element
  viewer.addEventListener("scene-graph-highlight", () => {
    requestAnimationFrame(() => {
      const num = partNumFromSceneGraph();
      if (num !== null) handlePartNum(num);
    });
  });
}, { once: true });

// ── Model URL builder ─────────────────────────────────────────
const modelUrl = (models, format) => {
  const m = models.find(m => (m.conversionFormat ?? m.type) === format);
  if (!m) return null;
  const blobId = m.modelBlobId ?? m.blobId;
  return blobId
    ? `${BASE_URL}/assets/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}/${blobId}`
    : null;
};

// ── Loading overlay ───────────────────────────────────────────
const loadingEl   = document.getElementById("viewer-loading");
const loadingBgEl = document.getElementById("viewer-loading-bg");
let loadingDone   = false;

const hideLoadingOverlay = () => {
  if (loadingDone) return;
  loadingDone = true;
  loadingEl?.classList.add("viewer-loading--done");
  loadingEl?.addEventListener("transitionend", () => {
    if (loadingEl) loadingEl.style.display = "none";
  }, { once: true });
  setTimeout(() => { if (loadingEl) loadingEl.style.display = "none"; }, 1000);
};

viewer.addEventListener("load",       hideLoadingOverlay, { once: true });
viewer.addEventListener("model-load", hideLoadingOverlay, { once: true });
setTimeout(hideLoadingOverlay, 14000);

// ── Fetch product and init viewer ─────────────────────────────
const product = await fetch(
  `${BASE_URL}/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}`
).then(r => r.json());

if (product.errors?.length) throw new Error(product.errors[0]);

const { models } = product.response.asset;
const viewerConfig = JSON.parse(product.response.viewerSettings.config);

assemblyName.textContent = product.response.name ?? "Mechanical Assembly";
document.title = `${product.response.name ?? "Parts Catalog"} — VNTANA`;

// Apply config then override locked settings
Object.assign(viewer, viewerConfig);
viewer.enableAutoRotate = false;
viewer.disableRotation  = false;

const glbUrl  = modelUrl(models, "GLB");
const usdzUrl = modelUrl(models, "USDZ");

Object.assign(viewer, {
  ...(glbUrl  && { src:     glbUrl }),
  ...(usdzUrl && { usdzSrc: usdzUrl }),
  poster: "renders/3-Layer Die Head 110mm Assembly_2560x1440.png",
});
