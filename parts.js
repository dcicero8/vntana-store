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
// e.composedPath() returns the full click path through ALL shadow boundaries —
// read it synchronously, store it, then find the most list-like element in it.
// This works for scene-graph row clicks without any shadow DOM traversal.
// For 3D canvas clicks we fall back to viewer.selection.background "change".

const meshPartMap = new WeakMap();
let nextPartNum = 1;
let lastPartNum = null;

const handlePartNum = (num) => {
  if (num !== null && num !== lastPartNum) {
    lastPartNum = num;
    showPart(num);
  }
};

// Scene-graph click: viewer capture → composedPath has the row element.
// Find the element with the most siblings (the list row).
let lastPath = [];
viewer.addEventListener("click", (e) => {
  lastPath = e.composedPath(); // must read synchronously

  requestAnimationFrame(() => {
    let bestEl = null, bestCount = 0;
    for (const el of lastPath) {
      if (!(el instanceof Element)) continue;
      const n = el.parentElement?.childElementCount ?? 0;
      if (n > bestCount) { bestCount = n; bestEl = el; }
    }
    if (bestEl && bestCount > 3) {
      const siblings = Array.from(bestEl.parentElement.children);
      const idx = siblings.indexOf(bestEl);
      console.log("[parts] composedPath best row: idx", idx, "of", bestCount, bestEl.tagName);
      if (idx >= 0) {
        if (!meshPartMap.has(bestEl)) meshPartMap.set(bestEl, nextPartNum++);
        handlePartNum(meshPartMap.get(bestEl));
      }
    }
  });
}, true);

// 3D canvas click fallback: viewer.selection.background fires "change".
// After change, check if composedPath already handled it (scene-graph case);
// if not, assign a new part number for the 3D selection.
const attach3DListener = () => {
  const sel = viewer.selection;
  if (!sel?.background?.addEventListener) return false;
  sel.background.addEventListener("change", () => {
    requestAnimationFrame(() => {
      // If composedPath found a list row (scene-graph click), already handled.
      // For pure 3D clicks the path won't have a list row, so we use a
      // per-change counter keyed on the change event object itself.
      if (lastPartNum !== null) return; // something already selected
      handlePartNum(nextPartNum++);
    });
  });
  console.log("[parts] attached selection.background change listener");
  return true;
};
if (!attach3DListener()) {
  viewer.addEventListener("load", attach3DListener, { once: true });
  setTimeout(attach3DListener, 5000);
}

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
