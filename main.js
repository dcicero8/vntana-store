// Placeholder demo asset — swap for your Live Public products
const organizationSlug = "asset-library";
const workspaceSlug = "viewer-demo";
const productUuid = "db656517-2842-4e64-a3de-743acee9ff9d";

const baseUrl = "https://api.vntana.com";

const product = await fetch(
  `${baseUrl}/products/${productUuid}/organizations/${organizationSlug}/clients/${workspaceSlug}`
).then(r => r.json());

if (product.errors.length > 0) throw new Error(product.errors);

const { models } = product.response.asset;

const getModelUrl = format => {
  const blob = models.find(m => m.conversionFormat === format);
  return blob
    ? `${baseUrl}/assets/products/${productUuid}/organizations/${organizationSlug}/clients/${workspaceSlug}/${blob.modelBlobId}`
    : null;
};

const viewer = document.querySelector("vntana-viewer");

Object.assign(viewer, JSON.parse(product.response.viewerSettings.config));
Object.assign(viewer, {
  src: getModelUrl("GLB"),
  usdzSrc: getModelUrl("USDZ"),
  poster: `${baseUrl}/assets/thumbnail/products/${productUuid}/organizations/${organizationSlug}/clients/${workspaceSlug}/`,
});

const qrButton = viewer.querySelector("vntana-qr-button");
if (qrButton) {
  qrButton.url = `https://embed.vntana.com?productUuid=${productUuid}&clientSlug=${workspaceSlug}&organizationSlug=${organizationSlug}&autoAR=true`;
}

// Variant button interactivity (wires up model swap when you add real assets)
document.querySelectorAll("#variant-buttons .variant-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#variant-buttons .variant-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("finish-label").textContent = btn.dataset.label;
    // When you have multiple product UUIDs:
    // viewer.src = getModelUrlForVariant(btn.dataset.uuid);
  });
});
