import { PRODUCTS, BASE_URL } from "./products.js";

// Read product identity from URL params
const params = new URLSearchParams(window.location.search);
const uuid = params.get("uuid");
const org = params.get("org");
const workspace = params.get("workspace");

if (!uuid || !org || !workspace) {
  window.location.href = "index.html";
  throw new Error("Missing product params");
}

// Merge static config (copy, features, variants) with live API data
const config = PRODUCTS.find(p => p.uuid === uuid) ?? {
  uuid, org, workspace,
  name: "Product", subtitle: "", price: "", category: "Products",
  breadcrumb: "Products", description: "", features: [], variants: [],
};

// Populate page copy immediately (no API wait)
document.title = `${config.name} — VNTANA Store`;
document.getElementById("product-name").textContent = config.name;
document.getElementById("product-subtitle").textContent = config.subtitle;
document.getElementById("product-price").textContent = config.price;
document.getElementById("product-description").textContent = config.description;
document.getElementById("breadcrumb-path").textContent = ` › ${config.breadcrumb.replace(" › ", " › ")}`;

// Render features
const featureList = document.getElementById("feature-list");
config.features.forEach(f => {
  const li = document.createElement("li");
  li.textContent = f;
  featureList.appendChild(li);
});

// Render variant buttons
const variantButtons = document.getElementById("variant-buttons");
const variantSelected = document.getElementById("variant-selected");
if (config.variants.length > 0) {
  variantSelected.textContent = config.variants[0].label;
  config.variants.forEach((v, i) => {
    const btn = document.createElement("button");
    btn.className = "variant-btn" + (i === 0 ? " active" : "");
    btn.textContent = v.label;
    btn.addEventListener("click", () => {
      variantButtons.querySelectorAll(".variant-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      variantSelected.textContent = v.label;
      if (v.uuid) {
        // Swap model when variant has its own product UUID
        viewer.src = getModelUrl(v.uuid, v.org ?? org, v.workspace ?? workspace, "GLB");
      }
    });
    variantButtons.appendChild(btn);
  });
} else {
  document.getElementById("variant-group").style.display = "none";
}

// Fetch live product data from VNTANA API
const product = await fetch(
  `${BASE_URL}/products/${uuid}/organizations/${org}/clients/${workspace}`
).then(r => r.json());

if (product.errors?.length > 0) throw new Error(product.errors);

const { models } = product.response.asset;

const getModelUrl = (pid, o, w, format) => {
  const blob = models.find(m => m.conversionFormat === format);
  return blob
    ? `${BASE_URL}/assets/products/${pid}/organizations/${o}/clients/${w}/${blob.modelBlobId}`
    : null;
};

const src = getModelUrl(uuid, org, workspace, "GLB");
const usdzSrc = getModelUrl(uuid, org, workspace, "USDZ");
const poster = `${BASE_URL}/assets/thumbnail/products/${uuid}/organizations/${org}/clients/${workspace}/`;
const qrUrl = `https://embed.vntana.com?productUuid=${uuid}&clientSlug=${workspace}&organizationSlug=${org}&autoAR=true`;

// Apply platform viewer settings then override with model URLs
const viewer = document.querySelector("vntana-viewer");
Object.assign(viewer, JSON.parse(product.response.viewerSettings.config));
Object.assign(viewer, { src, usdzSrc, poster });

const qrButton = viewer.querySelector("vntana-qr-button");
if (qrButton) qrButton.url = qrUrl;
