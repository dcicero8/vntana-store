import { PRODUCTS, BASE_URL } from "./products.js";

// ── Read URL params ──────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const org = params.get("org");
const workspace = params.get("workspace");
const uuid = params.get("uuid");
const variantGroupUuid = params.get("variantGroup");

if ((!uuid && !variantGroupUuid) || !org || !workspace) {
  window.location.href = "index.html";
  throw new Error("Missing product params");
}

// ── Find static config (copy, features, price) ───────────────
const config = PRODUCTS.find(p => p.uuid === (variantGroupUuid ?? uuid)) ?? {
  name: "Product", subtitle: "", price: "", category: "Products",
  breadcrumb: "Products", description: "", features: [],
};

// ── Populate page copy immediately (no API wait) ─────────────
document.title = `${config.name} — VNTANA Store`;
document.getElementById("product-name").textContent = config.name;
document.getElementById("product-subtitle").textContent = config.subtitle;
document.getElementById("product-price").textContent = config.price;
document.getElementById("product-description").textContent = config.description;
document.getElementById("breadcrumb-path").textContent =
  config.breadcrumb ? ` › ${config.breadcrumb}` : "";

config.features?.forEach(f => {
  const li = document.createElement("li");
  li.textContent = f;
  document.getElementById("feature-list").appendChild(li);
});

// ── Viewer helpers ───────────────────────────────────────────
const viewer = document.querySelector("vntana-viewer");
const qrButton = viewer.querySelector("vntana-qr-button");

const modelUrl = (models, productUuid, format) => {
  const blob = models.find(m => m.conversionFormat === format);
  return blob
    ? `${BASE_URL}/assets/products/${productUuid}/organizations/${org}/clients/${workspace}/${blob.modelBlobId}`
    : null;
};

const loadVariant = (variantProduct, viewerConfig) => {
  const { uuid: vid, asset: { models } } = variantProduct;
  if (viewerConfig) Object.assign(viewer, viewerConfig);
  Object.assign(viewer, {
    src: modelUrl(models, vid, "GLB"),
    usdzSrc: modelUrl(models, vid, "USDZ"),
    poster: `${BASE_URL}/assets/thumbnail/products/${vid}/organizations/${org}/clients/${workspace}/`,
  });
  if (qrButton) {
    qrButton.url = `https://embed.vntana.com?productUuid=${vid}&clientSlug=${workspace}&organizationSlug=${org}&autoAR=true`;
  }
};

// ── Variant button helpers ───────────────────────────────────
const variantButtons = document.getElementById("variant-buttons");
const variantSelected = document.getElementById("variant-selected");

const setActiveVariant = btn => {
  variantButtons.querySelectorAll(".variant-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
};

// ── VARIANT GROUP FLOW ───────────────────────────────────────
if (variantGroupUuid) {
  // Fetch the variant group
  const groupData = await fetch(
    `${BASE_URL}/variant-groups/organizations/${org}/clients/${workspace}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: variantGroupUuid, page: 1, size: 100 }),
    }
  ).then(r => r.json());

  const variants = groupData.response.products.grid;

  // Fetch viewer settings from the first variant
  const firstData = await fetch(
    `${BASE_URL}/products/${variants[0].uuid}/organizations/${org}/clients/${workspace}`
  ).then(r => r.json());

  const viewerConfig = JSON.parse(firstData.response.viewerSettings.config);

  // Load first variant into viewer
  loadVariant(variants[0], viewerConfig);

  // Extract color name from variant product name e.g. "VNTANA Jacket (Blue)" → "Blue"
  const colorName = v => (v.name.match(/\(([^)]+)\)/) ?? [])[1] ?? v.name;
  const colorMap = config.colorMap ?? {};

  variantSelected.textContent = colorName(variants[0]);

  variants.forEach((variant, i) => {
    const name = colorName(variant);
    const hex = colorMap[name] ?? "#cccccc";

    const btn = document.createElement("button");
    btn.className = "variant-btn swatch" + (i === 0 ? " active" : "");
    btn.setAttribute("style", `--swatch: ${hex}`);
    btn.setAttribute("aria-label", name);
    btn.title = name;

    btn.addEventListener("click", () => {
      setActiveVariant(btn);
      variantSelected.textContent = name;
      loadVariant(variant, null); // keep existing viewer config, just swap model
    });

    variantButtons.appendChild(btn);
  });

// ── SINGLE PRODUCT FLOW ──────────────────────────────────────
} else {
  const product = await fetch(
    `${BASE_URL}/products/${uuid}/organizations/${org}/clients/${workspace}`
  ).then(r => r.json());

  if (product.errors?.length > 0) throw new Error(product.errors);

  const { models } = product.response.asset;
  const viewerConfig = JSON.parse(product.response.viewerSettings.config);

  Object.assign(viewer, viewerConfig);
  Object.assign(viewer, {
    src: modelUrl(models, uuid, "GLB"),
    usdzSrc: modelUrl(models, uuid, "USDZ"),
    poster: `${BASE_URL}/assets/thumbnail/products/${uuid}/organizations/${org}/clients/${workspace}/`,
  });

  if (qrButton) {
    qrButton.url = `https://embed.vntana.com?productUuid=${uuid}&clientSlug=${workspace}&organizationSlug=${org}&autoAR=true`;
  }

  // Render static variants from config (label-only, no model swap)
  if (config.variants?.length > 0) {
    variantSelected.textContent = config.variants[0].label;
    config.variants.forEach((v, i) => {
      const btn = document.createElement("button");
      btn.className = "variant-btn" + (i === 0 ? " active" : "");
      btn.textContent = v.label;
      btn.addEventListener("click", () => {
        setActiveVariant(btn);
        variantSelected.textContent = v.label;
        if (v.uuid) loadVariant({ uuid: v.uuid, asset: { models } }, null);
      });
      variantButtons.appendChild(btn);
    });
  } else {
    document.getElementById("variant-group").style.display = "none";
  }
}
