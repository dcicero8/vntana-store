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

// ── Viewer controls: env, background, camera presets ─────────

const ENV_BASE = "https://storage.googleapis.com/static-prd-mul-reg-stn-unif-vntana-com/assets/environment_maps/";
const ENVIRONMENTS = {
  studio:  `${ENV_BASE}Indoor_Studio_2.hdr`,
  neutral: `${ENV_BASE}khronos_Neutral_512.hdr`,
  dim:     `${ENV_BASE}Studio_A_dim.hdr`,
};

// Quaternion presets for Y-axis camera snap (Y-up, front = model default).
// Tune if a specific model is oriented differently.
const CAM_ROTATIONS = {
  front:  { x:  0,     y:  0,      z: 0,    w: 1     },  // identity
  side:   { x:  0,     y:  0.7071, z: 0,    w: 0.7071 }, // 90° Y
  detail: { x: -0.17,  y:  0.44,   z: 0.08, w: 0.88  },  // elevated side angle
};

const BG_VALUES = {
  light: "#f0f0ef",
  white: "#ffffff",
  dark:  "radial-gradient(#484848, #000000)",
};

let savedViewerConfig = null;

// Call after viewerConfig is applied so env/bg buttons reflect platform defaults
// and Reset Camera knows what to snap back to.
const initViewerControls = (viewerConfig) => {
  savedViewerConfig = viewerConfig;

  // Sync the active env pill to whatever the platform configured
  const envSrcLower = (viewerConfig.environmentSrc ?? "").toLowerCase();
  let activeEnv = "studio";
  if (envSrcLower.includes("neutral")) activeEnv = "neutral";
  else if (envSrcLower.includes("dim"))     activeEnv = "dim";
  document.querySelectorAll("#env-buttons .vc-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.env === activeEnv);
  });
};

// Camera preset buttons
document.getElementById("camera-presets").addEventListener("click", e => {
  const btn = e.target.closest("[data-preset]");
  if (!btn) return;
  document.querySelectorAll("#camera-presets .vc-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const preset = btn.dataset.preset;
  if (preset === "reset" && savedViewerConfig) {
    // Restore only camera props from the platform config
    const vc = savedViewerConfig;
    const rot    = vc.cameraRotation  ?? vc.rotation;
    const dist   = vc.cameraDistance  ?? vc.distance;
    const target = vc.cameraTarget    ?? vc.target;
    const fov    = vc.fieldOfView     ?? vc.fov;
    const ortho  = vc.orthographicSize;
    if (rot    !== undefined) viewer.setCameraRotation(rot);
    if (dist   !== undefined) viewer.setCameraDistance(dist);
    if (target !== undefined) viewer.setCameraTarget(target);
    if (fov    !== undefined) viewer.setFieldOfView(fov);
    if (ortho  !== undefined) viewer.setOrthographicSize(ortho);
  } else if (CAM_ROTATIONS[preset]) {
    viewer.setCameraRotation(CAM_ROTATIONS[preset]);
  }
});

// Lighting / environment switcher
document.getElementById("env-buttons").addEventListener("click", e => {
  const btn = e.target.closest("[data-env]");
  if (!btn) return;
  document.querySelectorAll("#env-buttons .vc-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  viewer.environmentSrc = ENVIRONMENTS[btn.dataset.env];
});

// Background picker
document.getElementById("bg-buttons").addEventListener("click", e => {
  const btn = e.target.closest("[data-bg]");
  if (!btn) return;
  document.querySelectorAll("#bg-buttons .vc-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  viewer.background = BG_VALUES[btn.dataset.bg];
});

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

// ── Hotspot loader ───────────────────────────────────────────
const loadHotspots = async (productUuid) => {
  const data = await fetch(
    `${BASE_URL}/hotspots/search/organizations/${org}/clients/${workspace}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productUuid, page: 1, size: 100 }),
    }
  ).then(r => r.json());

  if (!data.success || data.response.totalCount === 0) return;

  // Close all other hotspots when one opens
  const closeAll = () =>
    viewer.querySelectorAll("vntana-hotspot.open").forEach(h => h.classList.remove("open"));

  data.response.grid.forEach((hs, idx) => {
    const dimensions = JSON.parse(hs.config.dimensions);
    const camera = hs.config.camera ? JSON.parse(hs.config.camera) : null;
    const explode = hs.config.explodedView ? JSON.parse(hs.config.explodedView) : null;

    const hotspot = document.createElement("vntana-hotspot");
    hotspot.position = dimensions.position;
    hotspot.normal = dimensions.normal;

    // Build popup content
    let contentHtml = "";
    if (hs.type === "IMAGE" && hs.blobId) {
      const imgUrl = `${BASE_URL}/assets/hotspots/organizations/${org}/clients/${workspace}/${hs.blobId}`;
      contentHtml = `
        <img src="${imgUrl}" alt="Hotspot image" onerror="this.style.display='none'">
        <div class="hotspot-text">${hs.description ?? ""}</div>
      `;
    } else {
      contentHtml = `<div class="hotspot-text">${hs.text ?? ""}</div>`;
    }

    hotspot.innerHTML = `
      <span class="hotspot-pin">${idx + 1}</span>
      <div class="hotspot-popup">
        <button class="hotspot-close" aria-label="Close">✕</button>
        ${contentHtml}
      </div>
    `;

    hotspot.addEventListener("click", e => {
      if (e.target.closest(".hotspot-popup")) return; // ignore clicks inside popup

      const isOpen = hotspot.classList.contains("open");
      closeAll();

      if (!isOpen) {
        hotspot.classList.add("open");

        // Snap camera
        if (camera) {
          viewer.setCameraRotation(camera.cameraRotation);
          viewer.setCameraDistance(camera.cameraDistance);
          viewer.setCameraTarget(camera.cameraTarget);
          viewer.setFieldOfView(camera.fieldOfView);
          viewer.setOrthographicSize(camera.orthographicSize);
        }
      }
    });

    // Close button inside popup
    hotspot.querySelector(".hotspot-close").addEventListener("click", e => {
      e.stopPropagation();
      hotspot.classList.remove("open");
    });

    viewer.append(hotspot);
  });

  // Click on viewer background closes all hotspots
  viewer.addEventListener("click", e => {
    if (!e.target.closest("vntana-hotspot")) closeAll();
  });
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
  const groupData = await fetch(
    `${BASE_URL}/variant-groups/organizations/${org}/clients/${workspace}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: variantGroupUuid, page: 1, size: 100 }),
    }
  ).then(r => r.json());

  const variants = groupData.response.products.grid;

  const firstData = await fetch(
    `${BASE_URL}/products/${variants[0].uuid}/organizations/${org}/clients/${workspace}`
  ).then(r => r.json());

  const viewerConfig = JSON.parse(firstData.response.viewerSettings.config);
  loadVariant(variants[0], viewerConfig);
  initViewerControls(viewerConfig);

  // Load hotspots for first variant
  loadHotspots(variants[0].uuid);

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
      loadVariant(variant, null);
      // Clear old hotspots and load new ones for this variant
      viewer.querySelectorAll("vntana-hotspot").forEach(h => h.remove());
      loadHotspots(variant.uuid);
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
  initViewerControls(viewerConfig);
  Object.assign(viewer, {
    src: modelUrl(models, uuid, "GLB"),
    usdzSrc: modelUrl(models, uuid, "USDZ"),
    poster: `${BASE_URL}/assets/thumbnail/products/${uuid}/organizations/${org}/clients/${workspace}/`,
  });

  if (qrButton) {
    qrButton.url = `https://embed.vntana.com?productUuid=${uuid}&clientSlug=${workspace}&organizationSlug=${org}&autoAR=true`;
  }

  // Load hotspots
  loadHotspots(uuid);

  // Render static variants from config
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
