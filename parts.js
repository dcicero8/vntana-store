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

// ── Parts map: selection ID → sequential part number ─────────
// Each unique part clicked gets a stable number (Part #1, Part #2…)
// so clicking the same part twice shows the same number.
const partMap = new Map();
let nextPartNum = 1;

const showPart = (selectionId) => {
  if (!partMap.has(selectionId)) partMap.set(selectionId, nextPartNum++);
  const num = partMap.get(selectionId);

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

// ── Extract a stable ID from a selection object ───────────────
const selectionId = (sel) => {
  if (!sel) return null;
  // Three.js objects carry uuid and numeric id — prefer uuid for stability
  if (sel.uuid)   return sel.uuid;
  if (sel.id !== undefined && sel.id !== null) return String(sel.id);
  if (sel.name)   return sel.name;
  // Array of selected objects
  if (Array.isArray(sel) && sel.length > 0)
    return sel[0]?.uuid ?? sel[0]?.id ?? sel[0]?.name ?? null;
  return null;
};

// ── Primary: post-click selection read ───────────────────────
// Fires on any click inside the viewer (capture phase) then
// reads viewer.scene.selection after two animation frames
// to ensure the selection has been committed.
let lastId = null;

const readSelection = () => {
  const scene = viewer.scene;
  if (!scene) return;

  const sel = scene.selection;
  console.log("[parts] scene.selection:", sel);

  const id = selectionId(sel);
  console.log("[parts] selection id:", id);

  if (id && id !== lastId) {
    lastId = id;
    showPart(id);
  }
};

viewer.addEventListener("click", () => {
  requestAnimationFrame(() => requestAnimationFrame(readSelection));
}, true); // capture so it fires even if the viewer stops propagation

// ── Backup: event name probe on scene + viewer ────────────────
// Logs whatever events fire so we can confirm the right name in DevTools.
viewer.addEventListener("load", () => {
  const scene = viewer.scene;
  if (!scene) return;

  const evts = [
    "selection-change", "select", "selected", "object-selected",
    "mesh-selected", "node-selected", "scene-graph-selection",
    "mesh-click", "click",
  ];

  evts.forEach(name => {
    scene.addEventListener(name, (e) => {
      console.log(`[parts] scene "${name}":`, e);
      const id = selectionId(e.detail ?? e.object ?? e.target);
      if (id && id !== lastId) { lastId = id; showPart(id); }
    });
    viewer.addEventListener(name, (e) => {
      console.log(`[parts] viewer "${name}":`, e);
    });
  });

  // Polling fallback — covers cases where neither click nor event fires
  setInterval(() => {
    try {
      const id = selectionId(viewer.scene?.selection);
      if (id && id !== lastId) { lastId = id; showPart(id); }
    } catch (_) {}
  }, 150);
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
