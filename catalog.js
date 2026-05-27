import { PRODUCTS, BASE_URL } from "./products.js";

const grid = document.getElementById("product-grid");

PRODUCTS.forEach(p => {
  const thumbUuid = p.type === "variant-group" ? p.catalogThumbnailUuid : p.uuid;
  const thumbnail = `${BASE_URL}/assets/thumbnail/products/${thumbUuid}/organizations/${p.org}/clients/${p.workspace}/`;

  const url = p.type === "variant-group"
    ? `product.html?variantGroup=${p.uuid}&org=${p.org}&workspace=${p.workspace}`
    : `product.html?uuid=${p.uuid}&org=${p.org}&workspace=${p.workspace}`;

  const card = document.createElement("a");
  card.href = url;
  card.className = "product-card";
  card.innerHTML = `
    <div class="card-image">
      <img src="${thumbnail}" alt="${p.name}" loading="lazy">
      <div class="card-badge">${p.type === "variant-group" ? `${p.colorMap ? Object.keys(p.colorMap).length : ""}  Colors · ` : ""}View in 3D</div>
    </div>
    <div class="card-info">
      <div class="card-category">${p.category}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-subtitle">${p.subtitle}</div>
      <div class="card-price">${p.price}</div>
    </div>
  `;
  grid.appendChild(card);
});
