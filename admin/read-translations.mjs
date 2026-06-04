/**
 * read-translations.mjs
 *
 * Reads hotspot_translations back from the public VNTANA API (no auth).
 * Run this to verify a write was successful, or to export current translations.
 *
 * Usage:
 *   node admin/read-translations.mjs
 */

const PUBLIC = "https://api.vntana.com";
const ORG    = "DCicero";
const WS     = "figurement";
const UUID   = "e5a84eb7-eaf2-44e6-82ed-6c10c9741e02";

const res     = await fetch(`${PUBLIC}/products/${UUID}/organizations/${ORG}/clients/${WS}`);
const product = (await res.json()).response;

const attr = product.attributes?.find(a => a.name === "hotspot_translations");

if (!attr) {
  console.log("No hotspot_translations attribute found on this product.");
  console.log("Run write-translations.mjs first.");
  process.exit(0);
}

const translations = JSON.parse(attr.value);
const locales = Object.keys(translations);

console.log(`Found translations for: ${locales.join(", ")}\n`);

for (const [locale, hotspots] of Object.entries(translations)) {
  console.log(`── ${locale.toUpperCase()} ──`);
  for (const [uuid, { title, description }] of Object.entries(hotspots)) {
    console.log(`  ${uuid.slice(0, 8)}…  ${title}`);
    console.log(`             ${description.slice(0, 80)}…`);
  }
  console.log();
}

// Also output as clean JSON for copy-paste back into hotspot-translations.html
console.log("── Raw JSON (paste into hotspot-translations.html translations object) ──");
console.log(JSON.stringify(translations, null, 2));
