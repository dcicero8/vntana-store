import { BASE_URL } from "./products.js";

// ── Asset config ─────────────────────────────────────────────
const UUID      = "4080e745-de21-49e8-a650-019544dea546";
const ORG       = "DCicero";
const WORKSPACE = "blender";

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

// ── Part renders (Figurement cloud renders, one per node) ────
const RENDERS = {
  "Lift_Arm_Lower_Beam":         "renders/sunsource/Lift_Arm_Lower_Beam.jpg",
  "Lift_Arm_Upper_Actuator_Base":"renders/sunsource/Lift_Arm_Upper_Actuator_Base.jpg",
  "Lift_Arm_Upper_Actuator_Stem":"renders/sunsource/Lift_Arm_Upper_Actuator_Stem.jpg",
  "Lift_Arm_Upper_Beam":         "renders/sunsource/Lift_Arm_Upper_Beam.jpg",
  "Lift_Arm_Upper_Lever_1":      "renders/sunsource/Lift_Arm_Upper_Lever_1.jpg",
  "Lift_Arm_Upper_Lever_2":      "renders/sunsource/Lift_Arm_Upper_Lever_2.jpg",
  "Lift_Bucket":                 "renders/sunsource/Lift_Bucket.jpg",
  "Lift_Lower_Arm_Actuator_Base":"renders/sunsource/Lift_Lower_Arm_Actuator_Base.jpg",
  "Lift_Lower_Arm_Actuator_Stem":"renders/sunsource/Lift_Lower_Arm_Actuator_Stem.jpg",
  "Lift_Turn_Root":              "renders/sunsource/Lift_Turn_Root.jpg",
  "MainBody":                    "renders/sunsource/MainBody.jpg",
  "Support_Beam_Front_Left":     "renders/sunsource/Support_Beam_Front_Left.jpg",
  "Support_Beam_Front_Right":    "renders/sunsource/Support_Beam_Front_Right.jpg",
  "Support_Beam_Rear_Left":      "renders/sunsource/Support_Beam_Rear_Left.jpg",
  "Support_Beam_Rear_Right":     "renders/sunsource/Support_Beam_Rear_Right.jpg",
  "Wheel_Front_Left":            "renders/sunsource/Wheel_Front_Left.jpg",
  "Wheel_Front_Right":           "renders/sunsource/Wheel_Front_Right.jpg",
  "Wheel_Rear_Left":             "renders/sunsource/Wheel_Rear_Left.jpg",
  "Wheel_Rear_Right":            "renders/sunsource/Wheel_Rear_Right.jpg",
  "Engine_Node_0":               "renders/sunsource/351W V8 Engine.png",
  "Battery_Node_0":              "renders/sunsource/12V Battery.png",
  "FuelPump_Node_0":             "renders/sunsource/Fuel Pump DFI HDP5.png",
  "FuelValve_Node_0":            "renders/sunsource/Fuel Selector Valve (3-Port).png",
  "BellHousing_node":            "renders/sunsource/Manual Transmission Bell Housing.png",
};

// ── Parts catalog ─────────────────────────────────────────────
// Keys match scene graph node names exactly (strip count suffix handled below).
const PARTS_DATA = {
  "Engine_Node_0": {
    sku: "SS-ENG-351W",
    display: "351W V8 Engine",
    series: "Ford 351 Windsor",
    price: "$4,850.00",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Ford 351 Windsor V8 engine, remanufactured to OEM specifications. 5.8L displacement, compatible with a wide range of mobile equipment and utility truck applications. SunSource-certified build with full warranty."
  },
  "Battery_Node_0": {
    sku: "SS-BAT-12V",
    display: "12V Automotive Battery",
    series: "Group 31 Heavy Duty",
    price: "$189.00",
    avail: "In Stock",
    lead: "Ships in 1–2 days",
    desc: "Heavy-duty Group 31 12V battery for utility truck and mobile equipment starting and auxiliary power. High cold-cranking amps rated for extreme conditions. SunSource-stocked with same-day availability at select branches."
  },
  "FuelPump_Node_0": {
    sku: "SS-FP-HDP5",
    display: "Fuel Pump DFI HDP5",
    series: "Bosch HDP5",
    price: "$620.00",
    avail: "In Stock",
    lead: "Ships in 3–5 days",
    desc: "Bosch HDP5 high-pressure direct fuel injection pump. Delivers precise fuel metering for DFI engine systems. OEM-equivalent replacement backed by SunSource technical support and warranty."
  },
  "FuelValve_Node_0": {
    sku: "SS-FV-3PORT",
    display: "Fuel Selector Valve (3-Port)",
    series: "Pollak Motorized",
    price: "$310.00",
    avail: "In Stock",
    lead: "Ships in 3–5 days",
    desc: "Pollak motorized 3-port fuel tank selector valve for dual-tank applications. Enables automatic or manual tank switching to maximize fuel capacity and range on utility vehicles. Direct OEM replacement."
  },
  "BellHousing_node": {
    sku: "SS-BH-MT",
    display: "Manual Transmission Bell Housing",
    series: "OEM Compatible",
    price: "$740.00",
    avail: "Built to Order",
    lead: "Est. 2–3 weeks",
    desc: "Heavy-duty manual transmission bell housing for utility truck drivetrain applications. Precision-machined for OEM fitment. SunSource sources and machines bell housing assemblies to match your transmission and engine combination."
  },
  "Wheel_Front_Left": {
    sku: "SS-PWD-42",
    display: "Planetary Wheel Drive (Front)",
    series: "Danfoss Series 40",
    price: "$200.00",
    avail: "In Stock",
    lead: "Ships in 3–5 days",
    desc: "Danfoss Series 40 planetary wheel drive for front axle drive applications. High-torque, compact design with integrated brake. Assembled and tested at SunSource. Available in multiple displacement configurations."
  },
  "Wheel_Front_Right": {
    sku: "SS-PWD-42",
    display: "Planetary Wheel Drive (Front)",
    series: "Danfoss Series 40",
    price: "$200.00",
    avail: "In Stock",
    lead: "Ships in 3–5 days",
    desc: "Danfoss Series 40 planetary wheel drive for front axle drive applications. High-torque, compact design with integrated brake. Assembled and tested at SunSource. Available in multiple displacement configurations."
  },
  "Wheel_Rear_Left": {
    sku: "SS-BAM-51",
    display: "Bent Axis Propel Motor (Rear)",
    series: "Danfoss Series 51",
    price: "$200.00",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Danfoss Series 51 bent axis variable motor for rear propel drive. High efficiency across full speed range, suitable for demanding mobile applications. SunSource-authorized build center with global product support."
  },
  "Wheel_Rear_Right": {
    sku: "SS-BAM-51",
    display: "Bent Axis Propel Motor (Rear)",
    series: "Danfoss Series 51",
    price: "$200.00",
    avail: "In Stock",
    lead: "Ships in 5–7 days",
    desc: "Danfoss Series 51 bent axis variable motor for rear propel drive. High efficiency across full speed range, suitable for demanding mobile applications. SunSource-authorized build center with global product support."
  },
  "Lift_Arm_Upper_Actuator_Base": {
    sku: "SS-WFP-PVG",
    display: "Work Function Pump",
    series: "Danfoss PVG Valve",
    price: "$200.00",
    avail: "In Stock",
    lead: "Ships in 3–5 days",
    desc: "Danfoss high-performance PVG proportional valve for work function circuits — lift, tilt, and auxiliary. SunSource is your source for PVG valves, assembled and tested in-house. Hybrid valve assemblies available."
  },
  "Lift_Bucket": {
    sku: "SS-ATT-BKT",
    display: "Lift Bucket Attachment",
    series: "OEM Compatible",
    price: "$200.00",
    avail: "In Stock",
    lead: "Contact for lead time",
    desc: "Heavy-duty lift bucket attachment for telehandler and loader applications. Compatible with standard quick-attach systems. SunSource provides full aftermarket support and replacement hydraulic components for attachment circuits."
  },
  "Lift_Arm_Lower_Beam": {
    sku: "SS-CYL-LB",
    display: "Lift Arm Hydraulic Cylinder",
    series: "Custom Build",
    price: "$200.00",
    avail: "Built to Order",
    lead: "Est. 2–3 weeks",
    desc: "Custom-built hydraulic cylinder for lower lift arm. SunSource designs and assembles custom cylinder solutions to match your machine's exact stroke, bore, and pressure requirements."
  },
  "Lift_Arm_Upper_Beam": {
    sku: "SS-CYL-UB",
    display: "Upper Arm Hydraulic Cylinder",
    series: "Custom Build",
    price: "$200.00",
    avail: "Built to Order",
    lead: "Est. 2–3 weeks",
    desc: "Custom-built hydraulic cylinder for upper lift arm. SunSource designs and assembles custom cylinder solutions to match your machine's exact stroke, bore, and pressure requirements."
  },
};

// ── Cart / quote ──────────────────────────────────────────────
let cartCount = 0;
const cartBtn   = document.getElementById("cart-btn");
const cartLabel = document.getElementById("cart-label");

const addToCart = (n = 1) => {
  cartCount += n;
  cartLabel.textContent = `Cart (${cartCount} item${cartCount === 1 ? "" : "s"})`;
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
    <td class="parts-table-price">${data.price}</td>
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
    price: "$200.00",
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
  partPriceEl.textContent  = data.price ?? "$200.00";
  const renderSrc = RENDERS[name];
  if (renderSrc) {
    partRenderEl.src    = renderSrc;
    partRenderEl.alt    = data.display ?? name;
    partRenderEl.hidden = false;
  } else {
    partRenderEl.hidden = true;
  }

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

// Aliases for nodes whose root name differs from the PARTS_DATA key
const PART_NODE_ALIASES = { "BellHousing_<STL_BINARY>": "BellHousing_node" };

const attachSelectionListener = () => {
  if (!viewer.selection?.highlight?.addEventListener) return false;

  viewer.selection.highlight.addEventListener("change", (event) => {
    let matched = null;
    event.changes.forEach((value, node) => {
      if (matched) return;
      let n = node;
      while (n) {
        const name = normalizePartName(n.name ?? "");
        const resolved = PART_NODE_ALIASES[name] ?? name;
        if (PARTS_DATA[resolved]) { matched = resolved; return; }
        n = n.parent;
      }
    });
    if (matched) {
      handlePartName(matched);
    } else {
      // Nothing in PARTS_DATA highlighted — reset so the same part can be re-clicked
      lastPartName = null;
    }
  });
  return true;
};
if (!attachSelectionListener()) {
  viewer.addEventListener("load", attachSelectionListener, { once: true });
}

// ── Explode slider ────────────────────────────────────────────
document.getElementById("explode-slider").addEventListener("input", (e) => {
  if (viewer.scene) viewer.scene.explodedStrength = parseFloat(e.target.value);
});

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
