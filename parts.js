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

// ── Debug overlay ────────────────────────────────────────────
const dbg = Object.assign(document.createElement("div"), {
  id: "parts-debug",
  innerHTML: "waiting for click…",
});
Object.assign(dbg.style, {
  position:"fixed", bottom:"12px", left:"12px", zIndex:9999,
  background:"rgba(0,0,0,0.8)", color:"#0f0", fontFamily:"monospace",
  fontSize:"11px", padding:"8px 12px", borderRadius:"6px",
  maxWidth:"360px", whiteSpace:"pre-wrap", pointerEvents:"none",
});
document.body.appendChild(dbg);
const log = (...args) => {
  console.log("[parts]", ...args);
  dbg.textContent = args.map(a => typeof a === "object" ? JSON.stringify(a) : a).join(" ");
};

// ── Selection detection ───────────────────────────────────────
// Two paths:
// 1. Canvas click → Three.js "select" event on viewer.selection
//    carries e.intersections[0].mesh.uuid (stable per mesh).
// 2. Scene-graph click → sets [highlighted] attr on the row element
//    (Lit ?attr binding, confirmed in bundle). scene-graph-highlight
//    CustomEvent is NOT composed so it can't cross the shadow boundary —
//    we use polling instead.

const meshPartMap = new Map();  // mesh uuid → part number
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

// Recursively search shadow roots for first element matching selector.
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

// Path 1: canvas click — attach to viewer.selection Three.js EventDispatcher.
// Try immediately (selection may exist before load) and again after load.
// viewer.selection = {background: EventDispatcher, highlight: EventDispatcher}
// These fire "change" when selection changes. Attach to both.
// Use MutationObserver on shadow DOM to catch what attribute actually changes.

let observerAttached = false;
const attachListeners = () => {
  const sel = viewer.selection;
  if (!sel?.background?.addEventListener) {
    log("not ready — sel:", JSON.stringify(sel)?.slice(0,80));
    return false;
  }

  // MutationObserver: log every attribute change in the full shadow tree
  // so we can see what selector to use for "selected" state
  if (!observerAttached && viewer.shadowRoot) {
    observerAttached = true;
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes") {
          log(`attr [${m.attributeName}] on <${m.target.tagName?.toLowerCase()}> = "${m.target.getAttribute(m.attributeName)}"`);
        }
      }
    });
    mo.observe(viewer.shadowRoot, { subtree: true, attributes: true });
    log("MutationObserver attached to shadowRoot");
  }

  const onSelChange = () => {
    log("selection.background changed — checking shadow DOM");
    requestAnimationFrame(() => {
      // Try every plausible selected-state selector and log what we find
      for (const sel of ["[highlighted]","[selected]","[active]","[aria-selected='true']",".highlighted",".selected",".active"]) {
        const el = deepQuery(viewer.shadowRoot, sel);
        if (el) {
          log(`found "${sel}" → <${el.tagName?.toLowerCase()}> "${el.textContent?.trim().slice(0,30)}"`);
          if (!meshPartMap.has(el)) meshPartMap.set(el, nextPartNum++);
          handlePartNum(meshPartMap.get(el));
          return;
        }
      }
      log("no selected element found in shadow DOM");
    });
  };

  sel.background.addEventListener("change", onSelChange);
  sel.highlight.addEventListener("change", onSelChange);
  log("attached background+highlight change listeners");
  return true;
};

if (!attachListeners()) {
  viewer.addEventListener("load", () => { log("load fired"); attachListeners(); }, { once: true });
  setTimeout(() => attachListeners(), 5000);
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
