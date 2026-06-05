import { BASE_URL } from "./products.js";

// ── Asset config ─────────────────────────────────────────────
const UUID      = "e62a1f09-a55f-48f6-826e-ec2f1030e9e6";
const ORG       = "DCicero";
const WORKSPACE = "n8n-work";

// ── DOM refs ─────────────────────────────────────────────────
const viewer        = document.querySelector("vntana-viewer");
const assemblyName  = document.getElementById("assembly-name");
const partDefault   = document.getElementById("part-default");
const partSelected  = document.getElementById("part-selected");
const partNameEl    = document.getElementById("part-name");
const partNumberEl  = document.getElementById("part-number");
const partDescEl    = document.getElementById("part-description");
const partSeriesEl  = document.getElementById("part-series");
const partAvailEl   = document.getElementById("part-availability");
const partLeadEl    = document.getElementById("part-lead-time");
const partPriceEl   = document.getElementById("part-price");
const partRenderEl  = document.getElementById("part-render");

// ── Parts catalog ─────────────────────────────────────────────
// Keys match scene graph node names exactly (strip count suffix handled below).
const PARTS_DATA = {
  "Wheel_Front_Left": {
    sku: "SS-PWD-42",
    display: "Planetary Wheel Drive (Front)",
    series: "Danfoss Series 40",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 3–5 days",
    desc: "Danfoss Series 40 planetary wheel drive for front axle drive applications. High-torque, compact design with integrated brake. Assembled and tested at SunSource. Available in multiple displacement configurations."
  },
  "Wheel_Front_Right": {
    sku: "SS-PWD-42",
    display: "Planetary Wheel Drive (Front)",
    series: "Danfoss Series 40",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 3–5 days",
    desc: "Danfoss Series 40 planetary wheel drive for front axle drive applications. High-torque, compact design with integrated brake. Assembled and tested at SunSource. Available in multiple displacement configurations."
  },
  "Wheel_Rear_Left": {
    sku: "SS-BAM-51",
    display: "Bent Axis Propel Motor (Rear)",
    series: "Danfoss Series 51",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Danfoss Series 51 bent axis variable motor for rear propel drive. High efficiency across full speed range, suitable for demanding mobile applications. SunSource-authorized build center with global product support."
  },
  "Wheel_Rear_Right": {
    sku: "SS-BAM-51",
    display: "Bent Axis Propel Motor (Rear)",
    series: "Danfoss Series 51",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Danfoss Series 51 bent axis variable motor for rear propel drive. High efficiency across full speed range, suitable for demanding mobile applications. SunSource-authorized build center with global product support."
  },
  "MainBody": {
    sku: "SS-ECS-100",
    display: "Electronic Control System",
    series: "Danfoss PLUS+1",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Danfoss PLUS+1 electronic control system with integrated telematics. Programmable controller for machine motion, operator interface, and real-time diagnostics. In-house design and technical support available from SunSource."
  },
  "Lift_Lower_Arm_Actuator_Base": {
    sku: "SS-HPM-90",
    display: "Hydrostatic Propel Pump",
    series: "Danfoss Series 90",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Danfoss Series 90 axial piston variable pump for hydrostatic transmission. Delivers precise speed and torque control for propel drive circuits. Stocked components available to assemble per your machine specifications."
  },
  "Lift_Lower_Arm_Actuator_Stem": {
    sku: "SS-HPM-90",
    display: "Hydrostatic Propel Motor",
    series: "Danfoss Series 90",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Danfoss Series 90 axial piston variable motor, paired with Series 90 pump for closed-loop hydrostatic transmission. High power density with smooth, stepless speed control across the full operating range."
  },
  "Lift_Arm_Upper_Actuator_Base": {
    sku: "SS-WFP-PVG",
    display: "Work Function Pump",
    series: "Danfoss PVG Valve",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 3–5 days",
    desc: "Danfoss high-performance PVG proportional valve for work function circuits — lift, tilt, and auxiliary. SunSource is your source for PVG valves, assembled and tested in-house. Hybrid valve assemblies available."
  },
  "Lift_Arm_Upper_Actuator_Stem": {
    sku: "SS-WFM-43",
    display: "Work Function Motor",
    series: "Danfoss Series 43",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Danfoss Series 43 orbital motor for work function drives. Compact, high-torque design ideal for lift arm, rotation, and auxiliary attachment circuits on mobile equipment."
  },
  "Lift_Bucket": {
    sku: "SS-ATT-BKT",
    display: "Lift Bucket Attachment",
    series: "OEM Compatible",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Contact for lead time",
    desc: "Heavy-duty lift bucket attachment for telehandler and loader applications. Compatible with standard quick-attach systems. SunSource provides full aftermarket support and replacement hydraulic components for attachment circuits."
  },
  "Lift_Arm_Lower_Beam": {
    sku: "SS-CYL-LB",
    display: "Lift Arm Hydraulic Cylinder",
    series: "Custom Build",
    price: "Contact for pricing",
    avail: "Built to Order",
    lead: "Est. 2–3 weeks",
    desc: "Custom-built hydraulic cylinder for lower lift arm. SunSource designs and assembles custom cylinder solutions to match your machine's exact stroke, bore, and pressure requirements."
  },
  "Lift_Arm_Upper_Beam": {
    sku: "SS-CYL-UB",
    display: "Upper Arm Hydraulic Cylinder",
    series: "Custom Build",
    price: "Contact for pricing",
    avail: "Built to Order",
    lead: "Est. 2–3 weeks",
    desc: "Custom-built hydraulic cylinder for upper lift arm. SunSource designs and assembles custom cylinder solutions to match your machine's exact stroke, bore, and pressure requirements."
  },
  "Support_Beam_Front_Left": {
    sku: "SS-FRM-SB",
    display: "Frame Support Assembly",
    series: "OEM Compatible",
    price: "Contact for pricing",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Structural frame support assembly. SunSource provides full aftermarket support for mobile equipment structural and hydraulic interface components."
  },
};

// ── Cart / quote ──────────────────────────────────────────────
let cartCount = 0;
const cartBtn   = document.getElementById("cart-btn");
const cartLabel = document.getElementById("cart-label");

const addToCart = (n = 1) => {
  cartCount += n;
  cartLabel.textContent = `Quote (${cartCount} item${cartCount === 1 ? "" : "s"})`;
  cartBtn.hidden = false;
  cartBtn.classList.add("cart-flash");
  setTimeout(() => cartBtn.classList.remove("cart-flash"), 600);
};

document.getElementById("btn-add-to-cart").addEventListener("click", () => {
  if (!lastPartName) return;
  addToCart(1);
});

const addAllToCart = () => addToCart(Object.keys(PARTS_DATA).length);
document.getElementById("btn-add-all").addEventListener("click", addAllToCart);
document.getElementById("btn-add-all-top").addEventListener("click", addAllToCart);

document.getElementById("breadcrumb-home").addEventListener("click", (e) => {
  e.preventDefault();
  lastPartName = null;
  partDefault.hidden = false;
  partDefault.style.display = "";
  partSelected.hidden = true;
  document.getElementById("breadcrumb-part").textContent = "";
});

// ── Build parts table ─────────────────────────────────────────
// Deduplicate by SKU for the table view
const tableEntries = [];
const seenSkus = new Set();
Object.entries(PARTS_DATA).forEach(([key, data]) => {
  if (!seenSkus.has(data.sku)) {
    seenSkus.add(data.sku);
    tableEntries.push([key, data]);
  }
});

const tbody = document.getElementById("parts-table-body");
tableEntries.forEach(([key, data]) => {
  const tr = document.createElement("tr");
  tr.dataset.partKey = key;
  tr.innerHTML = `
    <td class="parts-table-sku">${data.sku}</td>
    <td class="parts-table-name">${data.display}</td>
    <td class="parts-table-qty">${data.series}</td>
    <td class="parts-table-avail ${data.avail === "Built to Order" ? "avail-low" : "avail-in"}">${data.avail}</td>
    <td><button class="btn-table-cart">Add</button></td>
  `;
  tr.querySelector(".btn-table-cart").addEventListener("click", (e) => {
    e.stopPropagation();
    addToCart(1);
  });
  tr.addEventListener("click", () => handlePartName(key));
  tbody.appendChild(tr);
});

// ── Quantity control ─────────────────────────────────────────
let qty = 1;

// ── Show part detail ──────────────────────────────────────────
const showPart = (name) => {
  const data = PARTS_DATA[name] ?? {
    sku: "SS-???",
    display: name.replace(/_/g, " "),
    series: "—",
    price: "Contact for pricing",
    avail: "Contact us",
    lead: "—",
    desc: `Component of the mobile equipment assembly. Contact SunSource for specifications and availability.`,
  };

  partNameEl.textContent   = data.display ?? name.replace(/_/g, " ");
  partNumberEl.textContent = data.sku;
  partDescEl.textContent   = data.desc;
  partSeriesEl.textContent = data.series;
  partAvailEl.textContent  = data.avail;
  partLeadEl.textContent   = data.lead;
  partPriceEl.textContent  = data.price;
  partRenderEl.hidden      = true;

  document.getElementById("breadcrumb-part").textContent = ` › ${data.display ?? name.replace(/_/g, " ")}`;

  partDefault.hidden        = true;
  partDefault.style.display = "none";
  partSelected.hidden       = false;
};

// ── Selection detection ───────────────────────────────────────
let lastPartName = null;

const handlePartName = (name) => {
  if (name && name !== lastPartName) {
    lastPartName = name;
    showPart(name);
  }
};

const normalizePartName = (text) =>
  text?.replace(/\s*\(\d+\)\s*$/, "").trim() ?? "";

const attachSelectionListener = () => {
  if (!viewer.selection?.highlight?.addEventListener) return false;
  viewer.selection.highlight.addEventListener("change", (event) => {
    event.changes.forEach((value, node) => {
      if (value !== 0) return;
      let n = node;
      while (n) {
        const name = normalizePartName(n.name ?? "");
        if (PARTS_DATA[name]) { handlePartName(name); return; }
        n = n.parent;
      }
      // If no PARTS_DATA match, still show the node name
      const topName = normalizePartName(node.name ?? "");
      if (topName) handlePartName(topName);
    });
  });
  return true;
};
if (!attachSelectionListener()) {
  viewer.addEventListener("load", attachSelectionListener, { once: true });
}

// ── Loading overlay ───────────────────────────────────────────
const loadingEl   = document.getElementById("viewer-loading");
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

assemblyName.textContent = "BigTruck — Mobile Equipment Components";
document.title = "SunSource Mobile Equipment — VNTANA";

Object.assign(viewer, viewerConfig);
viewer.enableAutoRotate = false;
viewer.disableRotation  = false;

const glbModel = models.find(m => (m.conversionFormat ?? m.type) === "GLB");
const blobId   = glbModel?.modelBlobId ?? glbModel?.blobId;
if (blobId) {
  viewer.src = `${BASE_URL}/assets/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}/${blobId}`;
}
