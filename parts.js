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

// ── Selection detection ───────────────────────────────────────
// Bundle analysis: "select" fires on a Three.js EventDispatcher (not DOM),
// so we can't catch it with addEventListener on the viewer element.
// Confirmed path: viewer.selection.background fires a DOM "change" event
// when the selection changes. After that, we scrape the scene graph's
// shadow DOM to find which row is now highlighted.

let lastId = null;

// Walk shadow roots recursively to find a selected/active scene-graph row
const findSelectedName = () => {
  const roots = [viewer.shadowRoot, document.body];
  for (const root of roots) {
    if (!root) continue;
    // Direct query for highlighted row
    const hit = root.querySelector?.('[class*="selected"],[class*="active"],[aria-selected="true"]');
    if (hit) {
      const txt = hit.textContent?.trim();
      if (txt && txt.length > 1) return txt;
    }
    // Also dive into nested custom elements
    root.querySelectorAll?.("*")?.forEach(el => {
      if (el.shadowRoot) {
        const inner = el.shadowRoot.querySelector('[class*="selected"],[class*="active"],[aria-selected="true"]');
        if (inner?.textContent?.trim()?.length > 1) return; // handled below
      }
    });
  }
  // Deep shadow search
  const deepSearch = (root) => {
    if (!root) return null;
    const els = root.querySelectorAll?.("*") ?? [];
    for (const el of els) {
      if (el.shadowRoot) {
        const found = el.shadowRoot.querySelector('[class*="selected"],[class*="active"],[aria-selected="true"]');
        if (found?.textContent?.trim()?.length > 1) return found.textContent.trim();
        const deeper = deepSearch(el.shadowRoot);
        if (deeper) return deeper;
      }
    }
    return null;
  };
  return deepSearch(viewer.shadowRoot) ?? deepSearch(document.body);
};

viewer.addEventListener("load", () => {
  // Primary: viewer.selection.background "change" — confirmed in bundle
  const selLayer = viewer.selection;
  console.log("[parts] viewer.selection:", selLayer);

  if (selLayer?.background) {
    selLayer.background.addEventListener("change", () => {
      // Give the scene graph DOM a frame to update before reading it
      requestAnimationFrame(() => {
        const name = findSelectedName();
        console.log("[parts] background change → name:", name);
        if (name && name !== lastId) { lastId = name; showPart(name); }
      });
    });
    console.log("[parts] hooked viewer.selection.background change");
  }

  if (selLayer?.highlight) {
    selLayer.highlight.addEventListener("change", () => {
      requestAnimationFrame(() => {
        const name = findSelectedName();
        if (name && name !== lastId) { lastId = name; showPart(name); }
      });
    });
  }

  // Polling fallback every 250ms
  setInterval(() => {
    try {
      const name = findSelectedName();
      if (name && name !== lastId) { lastId = name; showPart(name); }
    } catch (_) {}
  }, 250);
}, { once: true });

// Capture-phase click fallback: read after two frames
viewer.addEventListener("click", () => {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const name = findSelectedName();
    console.log("[parts] post-click name:", name);
    if (name && name !== lastId) { lastId = name; showPart(name); }
  }));
}, true);

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
