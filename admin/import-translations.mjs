/**
 * import-translations.mjs
 *
 * Reads a filled-in hotspot-translations-template.xlsx and writes the
 * translations into the VNTANA product's `attributes` field via the platform API.
 *
 * Usage:
 *   VNTANA_EMAIL=dcicero8@gmail.com VNTANA_PASSWORD=xxx \
 *     node admin/import-translations.mjs admin/hotspot-translations-template.xlsx
 *
 * Requires:  npm install xlsx
 */

import { readFileSync } from "fs";
import { read, utils } from "xlsx";

const PLATFORM = "https://api-platform.vntana.com";
const PUBLIC   = "https://api.vntana.com";
const ORG      = "DCicero";
const WS       = "figurement";
const UUID     = "e5a84eb7-eaf2-44e6-82ed-6c10c9741e02";
const ATTR_KEY = "hotspot_translations";

const EMAIL    = process.env.VNTANA_EMAIL;
const PASSWORD = process.env.VNTANA_PASSWORD;
const FILE     = process.argv[2] ?? "admin/hotspot-translations-template.xlsx";

if (!EMAIL || !PASSWORD) {
  console.error("Set VNTANA_EMAIL and VNTANA_PASSWORD env vars before running.");
  process.exit(1);
}

// ── 1. Parse spreadsheet ──────────────────────────────────────────────────────
console.log(`Reading ${FILE}...`);
const wb   = read(readFileSync(FILE));
const ws   = wb.Sheets[wb.SheetNames[0]];
const rows = utils.sheet_to_json(ws, { defval: "" });

// Expected columns: Hotspot #, Hotspot UUID, EN Title, EN Description,
//                   FR Title, FR Description, ES Title, ES Description,
//                   DE Title, DE Description
const LANG_COLS = {
  fr: { title: "FR Title", description: "FR Description" },
  es: { title: "ES Title", description: "ES Description" },
  de: { title: "DE Title", description: "DE Description" },
};

const translations = {};

for (const row of rows) {
  const uuid = String(row["Hotspot UUID"] ?? "").trim();
  if (!uuid) continue;

  for (const [lang, cols] of Object.entries(LANG_COLS)) {
    const title       = String(row[cols.title]       ?? "").trim();
    const description = String(row[cols.description] ?? "").trim();
    if (!title && !description) continue; // skip empty cells

    if (!translations[lang]) translations[lang] = {};
    translations[lang][uuid] = { title, description };
  }
}

const locales  = Object.keys(translations);
const coverage = locales.map(l => `${l.toUpperCase()}: ${Object.keys(translations[l]).length} hotspots`);

if (!locales.length) {
  console.error("No translations found in spreadsheet. Fill in FR/ES/DE columns and try again.");
  process.exit(1);
}

console.log(`✓ Parsed translations — ${coverage.join(", ")}`);

// Show a preview
for (const [lang, hotspots] of Object.entries(translations)) {
  const first = Object.values(hotspots)[0];
  console.log(`  ${lang.toUpperCase()} sample: "${first.title}"`);
}

// ── 2. Authenticate ───────────────────────────────────────────────────────────
console.log("\nAuthenticating...");
const authRes = await fetch(`${PLATFORM}/v1/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD })
});

if (!authRes.ok) {
  console.error("Auth failed:", authRes.status, await authRes.text());
  process.exit(1);
}

const authData = await authRes.json();
const token    = authData?.response?.token ?? authData?.token ?? authData?.data?.token;
if (!token) {
  console.error("No token in auth response:", JSON.stringify(authData, null, 2));
  process.exit(1);
}
console.log("✓ Authenticated");

// ── 3. Fetch full product ─────────────────────────────────────────────────────
console.log("Fetching product...");
const productRes = await fetch(`${PUBLIC}/products/${UUID}/organizations/${ORG}/clients/${WS}`);
const product    = (await productRes.json()).response;
console.log(`✓ Got product: "${product.name}"`);

// ── 4. Upsert attribute ───────────────────────────────────────────────────────
const attrs = (product.attributes ?? []).filter(a => a.name !== ATTR_KEY);
attrs.push({ name: ATTR_KEY, value: JSON.stringify(translations) });
product.attributes = attrs;

// ── 5. PUT back ───────────────────────────────────────────────────────────────
console.log("Writing to VNTANA platform...");
const putRes = await fetch(`${PLATFORM}/v1/products`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({ uuid: UUID, organizationSlug: ORG, clientSlug: WS, ...product })
});

if (!putRes.ok) {
  console.error("PUT failed:", putRes.status, await putRes.text());
  process.exit(1);
}
console.log("✓ Written to platform");

// ── 6. Verify ─────────────────────────────────────────────────────────────────
console.log("Verifying via public API...");
const verifyRes  = await fetch(`${PUBLIC}/products/${UUID}/organizations/${ORG}/clients/${WS}`);
const verified   = (await verifyRes.json()).response;
const writtenAttr = verified.attributes?.find(a => a.name === ATTR_KEY);

if (writtenAttr) {
  const parsed = JSON.parse(writtenAttr.value);
  console.log(`✓ Confirmed — public API returns translations for: ${Object.keys(parsed).join(", ")}`);
} else {
  console.warn("⚠ Attribute not yet visible in public API — may take a moment.");
}

console.log("\nDone. The translation test page will now read these from the product attributes.");
