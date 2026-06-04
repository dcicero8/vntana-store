/**
 * test-put.mjs — minimal PUT test to find the correct body shape
 *
 * Usage:
 *   VNTANA_EMAIL=dcicero8@gmail.com VNTANA_PASSWORD=xxx node admin/test-put.mjs
 */

const PLATFORM = "https://api-platform.vntana.com";
const PUBLIC   = "https://api.vntana.com";
const ORG      = "DCicero";
const WS       = "figurement";
const UUID     = "e5a84eb7-eaf2-44e6-82ed-6c10c9741e02";

const EMAIL    = process.env.VNTANA_EMAIL;
const PASSWORD = process.env.VNTANA_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Set VNTANA_EMAIL and VNTANA_PASSWORD env vars.");
  process.exit(1);
}

// ── Auth ──────────────────────────────────────────────────────────────────────
console.log("Authenticating...");
const authRes = await fetch(`${PLATFORM}/v1/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD })
});
const authData = await authRes.json();
const token = authData?.response?.token ?? authData?.token ?? authData?.data?.token;
if (!token) { console.error("No token:", JSON.stringify(authData)); process.exit(1); }
console.log("✓ Token:", token.slice(0, 20) + "...");

// ── Fetch product from platform API (not public API) ──────────────────────────
// Try to get the platform-side product shape so we mirror it exactly
console.log("\nFetching product from PLATFORM API...");
const platRes = await fetch(`${PLATFORM}/v1/products/${UUID}`, {
  headers: { "Authorization": `Bearer ${token}` }
});
console.log("Platform GET status:", platRes.status);
const platText = await platRes.text();
console.log("Platform GET body:", platText.slice(0, 500));

// ── Fetch product from PUBLIC API ─────────────────────────────────────────────
console.log("\nFetching product from PUBLIC API...");
const pubRes  = await fetch(`${PUBLIC}/products/${UUID}/organizations/${ORG}/clients/${WS}`);
const pubData = await pubRes.json();
const product = pubData.response;
console.log("Public product keys:", Object.keys(product));

// ── Attempt 1: absolute minimum — just uuid + test attribute ─────────────────
console.log("\n--- Attempt 1: uuid only + attributes ---");
const body1 = {
  uuid: UUID,
  attributes: [{ name: "put_test", value: "hello_world" }]
};
await tryPut("Attempt 1", token, body1);

// ── Attempt 2: add org + workspace slugs ─────────────────────────────────────
console.log("\n--- Attempt 2: uuid + org/workspace slugs + attributes ---");
const body2 = {
  uuid: UUID,
  organizationSlug: ORG,
  clientSlug: WS,
  attributes: [{ name: "put_test", value: "hello_world" }]
};
await tryPut("Attempt 2", token, body2);

// ── Attempt 3: uuid + name (required?) + attributes ──────────────────────────
console.log("\n--- Attempt 3: uuid + name + org/ws + attributes ---");
const body3 = {
  uuid: UUID,
  name: product.name,
  organizationSlug: ORG,
  clientSlug: WS,
  attributes: [{ name: "put_test", value: "hello_world" }]
};
await tryPut("Attempt 3", token, body3);

// ── Attempt 4: use clientUuid + organizationUuid instead of slugs ─────────────
console.log("\n--- Attempt 4: uuid + name + clientUuid + organizationUuid + attributes ---");
const body4 = {
  uuid: UUID,
  name: product.name,
  clientUuid: product.clientUuid,
  organizationUuid: product.organizationUuid,
  attributes: [{ name: "put_test", value: "hello_world" }]
};
await tryPut("Attempt 4", token, body4);

async function tryPut(label, token, body) {
  console.log(`Body: ${JSON.stringify(body)}`);
  const res = await fetch(`${PLATFORM}/v1/products`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  console.log(`${label} → ${res.status}: ${text.slice(0, 300)}`);
  return res.status < 300;
}
