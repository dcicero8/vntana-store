import { BASE_URL } from "./products.js";

// ── Asset config (hardcoded for this demo) ───────────────────
const UUID      = "209dc3ab-e55d-4350-b758-da7503b70f65";
const ORG       = "DCicero";
const WORKSPACE = "figurement";

// ── Parts lookup table ───────────────────────────────────────
// Maps mesh name patterns → part details.
// Add real part numbers here once mesh names are confirmed from the scene graph.
const PARTS_CATALOG = [
  {
    match: /die head/i,
    partNumber: "DH-3L-001",
    description: "High-precision 3-layer co-extrusion die head. Precision-machined to ±0.01 mm tolerance for consistent wall thickness.",
    price: "$4,200.00",
    availability: "In Stock",
    leadTime: "Ships in 2–3 days",
  },
  {
    match: /cirpattern|circular/i,
    partNumber: "CP-RING-008",
    description: "Symmetrical bolt pattern ring assembly. Set of 8, stainless steel, rated to 350 bar working pressure.",
    price: "$340.00",
    availability: "In Stock",
    leadTime: "Ships in 1–2 days",
  },
  {
    match: /m12|tapped/i,
    partNumber: "BLT-M12-SS",
    description: "M12 stainless steel hex bolt, grade A4-80. Pack of 10. Corrosion-resistant for high-humidity environments.",
    price: "$28.00",
    availability: "In Stock",
    leadTime: "Same day",
  },
  {
    match: /flange/i,
    partNumber: "FL-DN50-316",
    description: "DN50 slip-on flange, 316L stainless steel. ASME B16.5 Class 150 rated.",
    price: "$185.00",
    availability: "In Stock",
    leadTime: "Ships in 1–2 days",
  },
  {
    match: /spring|coil/i,
    partNumber: "SP-COMP-12",
    description: "Compression spring, 12 mm OD, stainless steel. Rated for 50,000 cycle life under nominal load.",
    price: "$42.00",
    availability: "Low Stock",
    leadTime: "Ships in 3–5 days",
  },
  {
    match: /seal|o.?ring|gasket/i,
    partNumber: "SEAL-VITON-40",
    description: "Viton O-ring seal, 40 mm ID. Chemical-resistant, rated to 200°C continuous service temperature.",
    price: "$18.00",
    availability: "In Stock",
    leadTime: "Same day",
  },
];

// Fallback for unmapped parts — generates a plausible part number from the mesh name
const fallbackPart = (meshName) => ({
  partNumber: `P-${meshName.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "PART"}`,
  description: "Contact your sales representative for specifications and pricing for this component.",
  price: "Contact for pricing",
  availability: "Contact sales",
  leadTime: "—",
});

const findPart = (meshName) =>
  PARTS_CATALOG.find(p => p.match.test(meshName)) ?? fallbackPart(meshName);

// ── DOM refs ─────────────────────────────────────────────────
const viewer         = document.querySelector("vntana-viewer");
const assemblyName   = document.getElementById("assembly-name");
const partDefault    = document.getElementById("part-default");
const partSelected   = document.getElementById("part-selected");
const partNameEl     = document.getElementById("part-name");
const partNumberEl   = document.getElementById("part-number");
const partDescEl     = document.getElementById("part-description");
const partAvailEl    = document.getElementById("part-availability");
const partLeadEl     = document.getElementById("part-lead-time");
const partPriceEl    = document.getElementById("part-price");

// ── Quantity control ─────────────────────────────────────────
let qty = 1;
document.getElementById("qty-minus").addEventListener("click", () => {
  if (qty > 1) { qty--; document.getElementById("qty-value").textContent = qty; }
});
document.getElementById("qty-plus").addEventListener("click", () => {
  qty++; document.getElementById("qty-value").textContent = qty;
});

// ── Update right panel with selected part ────────────────────
const selectPart = (meshName) => {
  if (!meshName || meshName === "(unnamed)") return;

  const part = findPart(meshName);
  qty = 1;
  document.getElementById("qty-value").textContent = "1";

  partNameEl.textContent     = meshName;
  partNumberEl.textContent   = `Part # ${part.partNumber}`;
  partDescEl.textContent     = part.description;
  partAvailEl.textContent    = part.availability;
  partLeadEl.textContent     = part.leadTime;
  partPriceEl.textContent    = part.price;

  partDefault.hidden  = true;
  partSelected.hidden = false;
};

// ── Model URL builder ─────────────────────────────────────────
// Handles both field-name variants:
//   example-files workspace: { type, blobId }
//   figurement workspace:    { conversionFormat, modelBlobId }
const modelUrl = (models, format) => {
  const m = models.find(m => (m.conversionFormat ?? m.type) === format);
  if (!m) return null;
  const blobId = m.modelBlobId ?? m.blobId;
  return blobId
    ? `${BASE_URL}/assets/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}/${blobId}`
    : null;
};

// ── Loading overlay ───────────────────────────────────────────
const loadingEl  = document.getElementById("viewer-loading");
const loadingBgEl = document.getElementById("viewer-loading-bg");
let loadingDone = false;

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
const thumbBlobId = product.response.asset?.thumbnailBlobId;
const viewerConfig = JSON.parse(product.response.viewerSettings.config);

// Set assembly name from platform
assemblyName.textContent = product.response.name ?? "Mechanical Assembly";
document.title = `${product.response.name ?? "Parts Catalog"} — VNTANA`;

// Loading poster
if (thumbBlobId && loadingBgEl) {
  loadingBgEl.style.backgroundImage =
    `url(${BASE_URL}/assets/organizations/${ORG}/clients/${WORKSPACE}/thumbnail/${thumbBlobId})`;
}

// Apply viewer config and set src
Object.assign(viewer, viewerConfig);
viewer.enableAutoRotate = false;
viewer.disableRotation  = false;  // override any platform lock

const glbUrl  = modelUrl(models, "GLB");
const usdzUrl = modelUrl(models, "USDZ");
// Use the exploded view render as the loading poster — more evocative than thumbnail
const posterUrl = "renders/3-Layer Die Head 110mm Assembly_2560x1440.png";

Object.assign(viewer, {
  ...(glbUrl   && { src:     glbUrl }),
  ...(usdzUrl  && { usdzSrc: usdzUrl }),
  ...(posterUrl && { poster:  posterUrl }),
});

// ── Selection detection ───────────────────────────────────────
// The VNTANA scene graph sets viewer.scene.selection when a part
// is clicked. We probe common event names and fall back to polling.
viewer.addEventListener("load", () => {
  const scene = viewer.scene;
  if (!scene) return;

  // Try known event names — log unknown ones to console for debugging
  const selectionEvents = [
    "selection-change", "select", "selected", "object-selected",
    "mesh-selected", "node-selected", "scene-graph-selection",
  ];

  selectionEvents.forEach(evtName => {
    scene.addEventListener(evtName, (e) => {
      console.log(`[parts] scene event "${evtName}":`, e);
      const name = e.detail?.name ?? e.detail?.object?.name ?? e.object?.name;
      if (name) selectPart(name);
    });
  });

  // Also listen on the viewer element itself
  selectionEvents.forEach(evtName => {
    viewer.addEventListener(evtName, (e) => {
      console.log(`[parts] viewer event "${evtName}":`, e);
      const name = e.detail?.name ?? e.detail?.object?.name;
      if (name) selectPart(name);
    });
  });

  // Polling fallback: watch viewer.scene.selection for changes
  let lastSelected = null;
  setInterval(() => {
    try {
      const sel = viewer.scene?.selection;
      if (!sel) return;
      // Try common selection object shapes
      const name = sel.name ?? sel.object?.name ?? sel[0]?.name ?? sel.current?.name;
      if (name && name !== lastSelected) {
        lastSelected = name;
        console.log("[parts] selection poll detected:", name);
        selectPart(name);
      }
    } catch (_) {}
  }, 200);
}, { once: true });
