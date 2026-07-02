import { BASE_URL } from "./products.js";

const UUID      = "fdf10dcd-a843-4e1b-a02d-8ae208f89b8a";
const ORG       = "DCicero";
const WORKSPACE = "example-files";

const viewer       = document.querySelector("vntana-viewer");
const hotspotCards = document.getElementById("hotspot-cards");

// ── Cart ──────────────────────────────────────────────────────
let cartCount = 0;
let qty = 1;
const cartBtn   = document.getElementById("cart-btn");
const cartLabel = document.getElementById("cart-label");

document.getElementById("qty-minus").addEventListener("click", () => {
  if (qty > 1) { qty--; document.getElementById("qty-value").textContent = qty; }
});
document.getElementById("qty-plus").addEventListener("click", () => {
  qty++; document.getElementById("qty-value").textContent = qty;
});

document.getElementById("btn-add-to-cart").addEventListener("click", () => {
  cartCount += qty;
  cartLabel.textContent = `Cart (${cartCount} item${cartCount === 1 ? "" : "s"})`;
  cartBtn.hidden = false;
  cartBtn.classList.add("cart-flash");
  setTimeout(() => cartBtn.classList.remove("cart-flash"), 600);
});

// ── Color swatches (cosmetic — one model) ─────────────────────
document.getElementById("color-swatches").addEventListener("click", (e) => {
  const btn = e.target.closest(".variant-btn.swatch");
  if (!btn) return;
  document.querySelectorAll("#color-swatches .variant-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const color = btn.dataset.color;
  document.getElementById("color-label").textContent = color;
  document.getElementById("color-note").textContent =
    color === "Gloss White" ? "3D model shown in Gloss White" : `3D model shown in Gloss White (${color} colorway coming soon)`;
});

// ── Size buttons ──────────────────────────────────────────────
document.getElementById("size-buttons").addEventListener("click", (e) => {
  const btn = e.target.closest(".variant-btn");
  if (!btn) return;
  document.querySelectorAll("#size-buttons .variant-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("size-label").textContent = btn.dataset.size;
});

// ── Loading overlay ───────────────────────────────────────────
const loadingEl = document.getElementById("viewer-loading");
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

// ── Camera snap ───────────────────────────────────────────────
const snapCamera = (cam) => {
  if (!cam) return;
  try {
    if (cam.cameraRotation !== undefined) viewer.setCameraRotation(cam.cameraRotation);
    if (cam.cameraDistance !== undefined) viewer.setCameraDistance(cam.cameraDistance);
    if (cam.cameraTarget   !== undefined) viewer.setCameraTarget(cam.cameraTarget);
    if (cam.fieldOfView    !== undefined) viewer.setFieldOfView(cam.fieldOfView);
    if (cam.orthographicSize !== undefined) viewer.setOrthographicSize(cam.orthographicSize);
  } catch (_) {}
};

// ── Hotspot card activation ───────────────────────────────────
let activeCard = null;

const activateCard = (uuid) => {
  document.querySelectorAll(".hotspot-card").forEach(c => {
    c.classList.toggle("active", c.dataset.uuid === uuid);
  });
  activeCard = uuid;
};

// ── Build hotspot cards + inject <vntana-hotspot> elements ────
const buildHotspots = (hotspots) => {
  hotspots.forEach((hs, i) => {
    const dims   = hs.config?.dimensions ? JSON.parse(hs.config.dimensions) : null;
    const cam    = hs.config?.camera     ? JSON.parse(hs.config.camera)     : null;
    const desc   = hs.description ?? "";
    const isImg  = hs.type === "IMAGE";

    // Parse title / body from description HTML
    const tmp = document.createElement("div");
    tmp.innerHTML = desc;
    const boldEl = tmp.querySelector("b,strong");
    let title = boldEl?.textContent?.trim() ?? "";
    if (boldEl) boldEl.remove();
    let body = tmp.textContent.trim();
    if (!title) {
      // Fallback: first sentence as title
      const dot = body.indexOf(". ");
      title = dot > 0 ? body.slice(0, dot + 1) : body.slice(0, 60);
      body  = dot > 0 ? body.slice(dot + 2) : "";
    }

    // Hotspot image URL
    let imgSrc = null;
    if (isImg && hs.config?.blobId) {
      imgSrc = `${BASE_URL}/hotspots/images/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}/${hs.config.blobId}`;
    }

    // Sidebar card
    const card = document.createElement("div");
    card.className = "hotspot-card";
    card.dataset.uuid = hs.uuid;
    card.innerHTML = `
      <div class="hotspot-card-num">${i + 1}</div>
      <div class="hotspot-card-body">
        <div class="hotspot-card-title">${title}</div>
        ${body ? `<div class="hotspot-card-desc">${body}</div>` : ""}
      </div>
      ${imgSrc ? `<img class="hotspot-card-img" src="${imgSrc}" alt="${title}" loading="lazy">` : ""}
    `;
    card.addEventListener("click", () => {
      activateCard(hs.uuid);
      snapCamera(cam);
      // Open the hotspot pin
      document.querySelectorAll("vntana-hotspot").forEach(el => {
        if (el.dataset.uuid === hs.uuid) el.setAttribute("open", "");
        else el.removeAttribute("open");
      });
    });
    hotspotCards.appendChild(card);

    // 3D hotspot pin
    if (!dims?.position || !dims?.normal) return;
    const pin = document.createElement("vntana-hotspot");
    pin.setAttribute("slot", "hotspot-" + i);
    pin.setAttribute("data-position", dims.position);
    pin.setAttribute("data-normal",   dims.normal);
    pin.dataset.uuid = hs.uuid;

    const tooltip = document.createElement("div");
    tooltip.setAttribute("slot", "hotspot");
    tooltip.style.cssText = "max-width:200px; font-size:0.8rem; line-height:1.45; padding:0.1rem 0;";
    tooltip.innerHTML = `<strong style="display:block;margin-bottom:0.2rem;">${title}</strong>${body ? `<span style="color:#555">${body.slice(0, 120)}${body.length > 120 ? "…" : ""}</span>` : ""}`;
    pin.appendChild(tooltip);

    pin.addEventListener("click", () => {
      activateCard(hs.uuid);
      snapCamera(cam);
    });

    viewer.appendChild(pin);
  });
};

// ── Fetch product + hotspots, init viewer ─────────────────────
const [product, hsResp] = await Promise.all([
  fetch(`${BASE_URL}/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}`).then(r => r.json()),
  fetch(`${BASE_URL}/hotspots/search/organizations/${ORG}/clients/${WORKSPACE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productUuid: UUID, page: 1, size: 100 }),
  }).then(r => r.json()),
]);

if (product.errors?.length) throw new Error(product.errors[0]);

const { models } = product.response.asset;
const viewerConfig = JSON.parse(product.response.viewerSettings.config);

document.title = `${product.response.name ?? "RAWLINGS MACH Gloss"} — VNTANA Store`;

const modelUrl = (format) => {
  const m = models.find(m => (m.conversionFormat ?? m.type) === format);
  if (!m) return null;
  const blobId = m.modelBlobId ?? m.blobId;
  return blobId ? `${BASE_URL}/assets/products/${UUID}/organizations/${ORG}/clients/${WORKSPACE}/${blobId}` : null;
};

Object.assign(viewer, viewerConfig);
viewer.enableAutoRotate = false;

const glbUrl  = modelUrl("GLB");
const usdzUrl = modelUrl("USDZ");

Object.assign(viewer, {
  ...(glbUrl  && { src:     glbUrl }),
  ...(usdzUrl && { usdzSrc: usdzUrl }),
});

// Inject hotspots after model loads
const hotspots = hsResp?.response?.grid ?? [];
if (hotspots.length) {
  viewer.addEventListener("load", () => buildHotspots(hotspots), { once: true });
}
