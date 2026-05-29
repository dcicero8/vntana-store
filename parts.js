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
// Strategy: find all scene-graph row elements, then return the 1-based index
// of whichever one is currently marked selected. Index = part number.
// This is more reliable than WeakMap on a DOM reference, because the viewer
// may reuse a single "selected" container element rather than per-row nodes.

let lastPartNum = null;

// Row selectors tried in order — first one that returns >1 results wins.
const ROW_SELECTORS = [
  '[role="treeitem"]',
  '[class*="scene-graph-item"]',
  '[class*="tree-item"]',
  '[class*="node-row"]',
  '[class*="mesh-row"]',
  '[class*="mesh-item"]',
  '[class*="SceneGraph"] li',
];

const findSelectedPartNum = () => {
  const search = (root) => {
    if (!root) return null;

    for (const sel of ROW_SELECTORS) {
      const items = root.querySelectorAll(sel);
      if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const el   = items[i];
          const cls  = el.getAttribute("class") ?? "";
          const isSelected =
            cls.includes("selected") ||
            cls.includes("active")   ||
            el.getAttribute("aria-selected") === "true" ||
            el.getAttribute("aria-current")  === "true";
          if (isSelected) {
            console.log(`[parts] found selected at index ${i} via "${sel}"`);
            return i + 1; // 1-based part number
          }
        }
      }
    }

    // Recurse into nested shadow roots
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) {
        const result = search(el.shadowRoot);
        if (result !== null) return result;
      }
    }
    return null;
  };

  return search(viewer.shadowRoot) ?? search(document.body);
};

const checkSelection = () => {
  try {
    const num = findSelectedPartNum();
    if (num !== null && num !== lastPartNum) {
      lastPartNum = num;
      showPart(num);
    }
  } catch (_) {}
};

viewer.addEventListener("load", () => {
  const selLayer = viewer.selection;
  console.log("[parts] viewer.selection:", selLayer);

  if (selLayer?.background) {
    selLayer.background.addEventListener("change", () =>
      requestAnimationFrame(checkSelection)
    );
  }
  if (selLayer?.highlight) {
    selLayer.highlight.addEventListener("change", () =>
      requestAnimationFrame(checkSelection)
    );
  }

  // Polling fallback — catches scene-graph clicks viewer events may miss
  setInterval(checkSelection, 250);
}, { once: true });

// Capture-phase click: check after two frames so scene graph has updated
viewer.addEventListener("click", () =>
  requestAnimationFrame(() => requestAnimationFrame(checkSelection))
, true);

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
