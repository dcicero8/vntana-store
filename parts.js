import { BASE_URL } from "./products.js";

// ── Asset config ─────────────────────────────────────────────
const UUID      = "7b28ac78-89ca-4bd8-9948-5076439eb496";
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
const partPriceEl   = document.getElementById("part-price");
const partRenderEl  = document.getElementById("part-render");

// ── Cart ──────────────────────────────────────────────────────
let cartCount = 0;
const cartBtn   = document.getElementById("cart-btn");
const cartLabel = document.getElementById("cart-label");

const addToCart = (n = 1) => {
  cartCount += n;
  cartLabel.textContent = `Cart (${cartCount} item${cartCount === 1 ? "" : "s"})`;
  cartBtn.hidden = false;
  // Flash the button
  cartBtn.classList.add("cart-flash");
  setTimeout(() => cartBtn.classList.remove("cart-flash"), 600);
};

document.getElementById("btn-add-to-cart").addEventListener("click", () => {
  if (!lastPartName) return;
  addToCart(qty);
});

const addAllToCart = () => {
  const total = Object.values(PARTS_DATA).reduce((sum, p) => sum + (p.qty ?? 1), 0);
  addToCart(total);
};
document.getElementById("btn-add-all").addEventListener("click", addAllToCart);
document.getElementById("btn-add-all-top").addEventListener("click", addAllToCart);

// ── Build parts catalog table ─────────────────────────────────
const tbody = document.getElementById("parts-table-body");
Object.entries(PARTS_DATA).forEach(([key, data]) => {
  const tr = document.createElement("tr");
  tr.dataset.partKey = key;
  tr.innerHTML = `
    <td class="parts-table-sku">${data.sku}</td>
    <td class="parts-table-name">${key.replace(/_/g, " ")}</td>
    <td class="parts-table-qty">${data.qty ?? 1}</td>
    <td class="parts-table-price">${data.price}${data.qty > 1 ? `<span class="part-price-note"> /set</span>` : ""}</td>
    <td class="parts-table-avail ${data.avail === "Out of Stock" ? "avail-out" : data.avail === "Low Stock" ? "avail-low" : "avail-in"}">${data.avail}</td>
    <td><button class="btn-table-cart" ${data.avail === "Out of Stock" ? "disabled" : ""}>Add</button></td>
  `;
  tr.querySelector(".btn-table-cart").addEventListener("click", (e) => {
    e.stopPropagation();
    addToCart(data.qty ?? 1);
  });
  // Clicking a row highlights the part name (triggers PDP if scene graph is open)
  tr.addEventListener("click", () => handlePartName(key));
  tbody.appendChild(tr);
});

// ── Quantity control ─────────────────────────────────────────
let qty = 1;
document.getElementById("qty-minus").addEventListener("click", () => {
  if (qty > 1) { qty--; document.getElementById("qty-value").textContent = qty; }
});
document.getElementById("qty-plus").addEventListener("click", () => {
  qty++; document.getElementById("qty-value").textContent = qty;
});

// ── Parts catalog data ────────────────────────────────────────
// Keys match scene graph node names (underscores, no count suffix).
const PARTS_DATA = {
  "Booster":      { sku: "DH-001", price: "$18.00", qty: 1,  avail: "In Stock",     lead: "Ships in 1–2 days",  desc: "Primary booster assembly for the 3-Layer Die Head 110mm. Maintains extrusion pressure across all three material layers." },
  "Bolts":        { sku: "DH-002", price: "$67.50", qty: 27, avail: "In Stock",     lead: "Ships in 1–2 days",  desc: "High-tensile fastener set. Complete set of 27. Grade 8.8, M12 × 40mm, zinc-plated. Priced per set." },
  "Fetzer_Valve": { sku: "DH-003", price: "$34.00", qty: 1,  avail: "In Stock",     lead: "Ships in 3–5 days",  desc: "Precision flow-control valve for material channel regulation. Compatible with all Ø110mm die head configurations." },
  "Long_Bolt":    { sku: "DH-004", price: "$24.00", qty: 6,  avail: "In Stock",     lead: "Ships in 1–2 days",  desc: "Extended M12 through-bolt, 120mm. Used for deep-channel flange attachment. Priced per set of 6." },
  "Mandrel":      { sku: "DH-005", price: "$62.00", qty: 1,  avail: "In Stock",     lead: "Ships in 5–7 days",  desc: "Core mandrel — sets the inner diameter of the extruded tube. Precision-ground to ±0.01mm tolerance." },
  "Gasket_Head":  { sku: "DH-006", price: "$11.00", qty: 1,  avail: "In Stock",     lead: "Ships in 1–2 days",  desc: "High-temp silicone gasket for head-to-body seal. Rated to 280°C continuous. Sold individually." },
  "Outer_Ring":   { sku: "DH-007", price: "$27.00", qty: 1,  avail: "In Stock",     lead: "Ships in 3–5 days",  desc: "Hardened steel outer ring. Maintains concentricity of die head assembly under thermal load." },
  "O-Ring":       { sku: "DH-008", price: "$3.50",  qty: 1,  avail: "In Stock",     lead: "Ships in 1–2 days",  desc: "Viton O-ring. Chemical-resistant, rated to 200°C. Fits all Ø110mm die head variants." },
  "Core_Winder":  { sku: "DH-009", price: "$45.00", qty: 1,  avail: "Low Stock",    lead: "Ships in 7–10 days", desc: "Internal winding guide for multi-layer co-extrusion. Precision-machined from tool steel." },
  "Back_Plate":   { sku: "DH-010", price: "$38.00", qty: 1,  avail: "In Stock",     lead: "Ships in 3–5 days",  desc: "Rear closure plate for die head body. Includes integral inlet ports for up to 3 material feeds." },
  "Casing":       { sku: "DH-011", price: "$89.00", qty: 1,  avail: "In Stock",     lead: "Ships in 5–7 days",  desc: "Main outer casing — full die head body shell. Machined from 316 stainless. OEM specification." },
  "Back_Housing": { sku: "DH-012", price: "$54.00", qty: 1,  avail: "Out of Stock", lead: "Est. 3–4 weeks",     desc: "Rear housing assembly. Houses the material distribution channels and primary inlet connections." },
  "Main_Dowel":   { sku: "DH-013", price: "$8.00",  qty: 1,  avail: "In Stock",     lead: "Ships in 1–2 days",  desc: "Alignment dowel pin, 12mm × 50mm. Ensures repeatable head positioning on disassembly and reassembly.", render: "renders/parts/Main_Dowel.jpg" },
  // renders added as they're produced in Figurement
};

// Figurement renders — one per part
const RENDERS = {
  "Booster":      "renders/parts/Booster.jpg",
  "Bolts":        "renders/parts/Bolts.jpg",
  "Fetzer_Valve": "renders/parts/Fetzer_Valve.jpg",
  "Long_Bolt":    "renders/parts/Long_Bolt.jpg",
  "Mandrel":      "renders/parts/Mandrel.jpg",
  "Gasket_Head":  "renders/parts/Gasket_Head.jpg",
  "Outer_Ring":   "renders/parts/Outer_Ring.jpg",
  "O-Ring":       "renders/parts/O-Ring.jpg",
  "Core_Winder":  "renders/parts/Core_Winder.jpg",
  "Back_Plate":   "renders/parts/Back_Plate.jpg",
  "Casing":       "renders/parts/Casing.jpg",
  "Back_Housing": "renders/parts/Back_Housing.jpg",
  "Main_Dowel":   "renders/parts/Main_Dowel.jpg",
};

// Normalize a scene-graph label to a PARTS_DATA key:
// strip count suffix like " (27)" and trim whitespace.
const normalizePartName = (text) =>
  text?.replace(/\s*\(\d+\)\s*$/, "").trim() ?? "";

const showPart = (name) => {
  const data = PARTS_DATA[name] ?? {
    sku: "DH-???", price: "—", avail: "Contact us", lead: "—",
    desc: `Component of the 3-Layer Die Head 110mm Assembly. Contact sales for pricing and availability.`,
  };

  qty = data.qty ?? 1;
  document.getElementById("qty-value").textContent = qty;

  partNameEl.textContent   = name.replace(/_/g, " ");
  partNumberEl.textContent = data.sku;
  partDescEl.textContent   = data.desc;
  partAvailEl.textContent  = data.avail;
  partLeadEl.textContent   = data.lead;
  partPriceEl.textContent  = data.qty > 1
    ? `${data.price} <span class="part-price-note">/ set of ${data.qty}</span>`
    : data.price;
  partPriceEl.innerHTML = partPriceEl.textContent; // allow the span

  // Part render image
  const renderSrc = RENDERS[name];
  if (renderSrc) {
    partRenderEl.src    = renderSrc;
    partRenderEl.alt    = name.replace(/_/g, " ");
    partRenderEl.hidden = false;
  } else {
    partRenderEl.hidden = true;
  }

  // Grey out add-to-cart if out of stock
  document.querySelector(".btn-primary").disabled = data.avail === "Out of Stock";

  partDefault.hidden       = true;
  partDefault.style.display = "none";   // belt-and-suspenders: override any CSS display rule
  partSelected.hidden       = false;
};

// ── Selection detection ───────────────────────────────────────
// e.composedPath() returns the full click path through ALL shadow boundaries —
// read it synchronously, store it, then find the most list-like element in it.
// This works for scene-graph row clicks without any shadow DOM traversal.
// For 3D canvas clicks we fall back to viewer.selection.background "change".

let lastPartName = null;

const handlePartName = (name) => {
  if (name && name !== lastPartName) {
    lastPartName = name;
    showPart(name);
  }
};

// Find a PARTS_DATA key near el.
// At each DOM level: check the element, then scan previous siblings.
// This handles both nested DOM and flat virtualised lists (CSS depth indentation).
const tryKeyFromEl = (el) => {
  if (!(el instanceof Element)) return null;
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const k = normalizePartName(child.textContent);
      if (PARTS_DATA[k]) return k;
    }
  }
  if ((el.textContent?.length ?? 999) < 60) {
    const k = normalizePartName(el.textContent);
    if (PARTS_DATA[k]) return k;
  }
  return null;
};

const partNameFromEl = (startEl) => {
  let node = startEl instanceof Element ? startEl : startEl?.parentElement;
  while (node) {
    // Check this node
    const k = tryKeyFromEl(node);
    if (k) return k;
    // Scan previous siblings at this level (for flat scene-graph lists)
    let sib = node.previousElementSibling;
    while (sib) {
      const k2 = tryKeyFromEl(sib);
      if (k2) return k2;
      sib = sib.previousElementSibling;
    }
    node = node.parentElement;
  }
  return null;
};

// Track whether the click handler itself found and handled a part name.
// Only suppress background.change when this is true (not on ALL clicks).
let clickHandled = false;

document.addEventListener("click", (e) => {
  clickHandled = false;
  const path = e.composedPath();

  // Pass 1: direct text scan of composedPath (handles clicking named rows)
  for (const el of path) {
    if (!(el instanceof Element)) continue;
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const key = normalizePartName(node.textContent);
        if (PARTS_DATA[key]) { clickHandled = true; handlePartName(key); return; }
      }
    }
    if ((el.textContent?.length ?? 999) < 50) {
      const key = normalizePartName(el.textContent);
      if (key && PARTS_DATA[key]) { clickHandled = true; handlePartName(key); return; }
    }
  }

  // Pass 2: flat-list sibling scan on innermost element (handles Mesh_N rows)
  const firstEl = path.find(el => el instanceof Element);
  if (firstEl) {
    const key = partNameFromEl(firstEl);
    if (key) { clickHandled = true; handlePartName(key); }
  }
}, true);

// Recursively search all nested shadow roots for first match.
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

// 3D canvas click: viewer.selection.background fires "change".
// After it fires, the scene graph highlights the selected node — read its text.

const attach3DListener = () => {
  const sel = viewer.selection;
  if (!sel?.background?.addEventListener) return false;
  sel.background.addEventListener("change", () => {
    if (clickHandled) { clickHandled = false; return; }
    // 3D canvas click — the permanent MutationObserver will fire when
    // Lit sets [highlighted] on the scene-graph row. Nothing else needed here.
  });
  return true;
};
if (!attach3DListener()) {
  viewer.addEventListener("load", attach3DListener, { once: true });
  setTimeout(attach3DListener, 5000);
}

// Permanent MutationObserver — watches ALL accessible shadow roots for [highlighted].
// Set up once so it catches every selection without per-click setup/teardown.
const watchedRoots = new WeakSet();
const observeRoot = (root) => {
  if (!root || watchedRoots.has(root)) return;
  watchedRoots.add(root);
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.attributeName === "highlighted" && m.target.hasAttribute?.("highlighted")) {
        if (!clickHandled) {
          const key = partNameFromEl(m.target);
          if (key) handlePartName(key);
        }
      }
      // Watch for new custom elements being added that might have shadow roots
      for (const node of m.addedNodes ?? []) {
        if (node.shadowRoot) observeRoot(node.shadowRoot);
      }
    }
  });
  mo.observe(root, { subtree: true, attributes: true, attributeFilter: ["highlighted"], childList: true });
  // Recurse into nested open shadow roots
  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) observeRoot(el.shadowRoot);
  }
};

// Auto-open and auto-expand the scene graph so named part rows exist in the DOM.
// Without this, [highlighted] is never set because the rows aren't rendered.
const autoExpandSceneGraph = () => {
  // Open the scene graph panel by clicking the button inside the viewer shadow DOM
  const deepClick = (root, selector) => {
    if (!root) return false;
    const el = root.querySelector(selector);
    if (el) { el.click(); return true; }
    for (const child of root.querySelectorAll("*")) {
      if (child.shadowRoot && deepClick(child.shadowRoot, selector)) return true;
    }
    return false;
  };

  // Click the scene graph toggle button to open the panel
  deepClick(viewer.shadowRoot, "vntana-scene-graph-button button, [class*='scene-graph'] button, button[aria-label*='scene'], button[aria-label*='Scene']");

  // After panel opens, click all "+" expand buttons repeatedly to expand the tree
  const expandAll = () => {
    const clickExpanders = (root) => {
      if (!root) return 0;
      let count = 0;
      // Look for collapsed row expand buttons (aria-expanded=false or "+" text)
      root.querySelectorAll("[aria-expanded='false'], [aria-expanded='0']").forEach(el => {
        el.click(); count++;
      });
      root.querySelectorAll("*").forEach(el => {
        if (el.shadowRoot) count += clickExpanders(el.shadowRoot);
      });
      return count;
    };
    return clickExpanders(viewer.shadowRoot) + clickExpanders(document.body);
  };

  // Expand in waves — each expansion may reveal more collapsed nodes
  setTimeout(() => {
    expandAll();
    setTimeout(() => {
      expandAll();
      setTimeout(() => {
        expandAll();
        // Now start observing — scene graph rows should be in DOM
        if (viewer.shadowRoot) observeRoot(viewer.shadowRoot);
        observeRoot(document.body);
      }, 300);
    }, 300);
  }, 500);
};

// Attach after load so viewer shadow DOM is populated
const startObserving = () => {
  if (viewer.shadowRoot) observeRoot(viewer.shadowRoot);
  observeRoot(document.body);
  autoExpandSceneGraph();
};
viewer.addEventListener("load", startObserving, { once: true });
setTimeout(startObserving, 5000);

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
