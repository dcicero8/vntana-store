/**
 * write-translations.mjs
 *
 * Writes hotspot translations into a VNTANA product's `attributes` field
 * via the platform API. Run once whenever translations change.
 *
 * Usage:
 *   VNTANA_EMAIL=dcicero8@gmail.com VNTANA_PASSWORD=xxx node admin/write-translations.mjs
 *
 * What it does:
 *   1. Authenticates and gets a JWT
 *   2. Fetches the full product from the platform API
 *   3. Upserts a single attribute: { name: "hotspot_translations", value: <JSON string> }
 *   4. PUTs the full product back
 *
 * The embed/viewer page then reads it back from the public API
 * (no auth needed) and applies the translations at runtime.
 */

const PLATFORM  = "https://api-platform.vntana.com";
const PUBLIC    = "https://api.vntana.com";
const ORG       = "DCicero";
const WS        = "figurement";
const UUID      = "e5a84eb7-eaf2-44e6-82ed-6c10c9741e02";

const EMAIL     = process.env.VNTANA_EMAIL;
const PASSWORD  = process.env.VNTANA_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Set VNTANA_EMAIL and VNTANA_PASSWORD env vars before running.");
  process.exit(1);
}

// ── Translations to write ─────────────────────────────────────────────────────
// Key = hotspot UUID from the VNTANA platform
// Each locale maps uuid → { title, description }
const TRANSLATIONS = {
  fr: {
    "9f6157ae-10a6-4c25-aa25-df2885ebbcae": {
      title: "Commandes de joystick sélectionnables",
      description: "Contrôle manuel à faible effort de toutes les fonctions du groupe de travail et possibilité de basculer entre les schémas de commande ISO et H."
    },
    "6d4f81d9-47d9-4e38-857a-1e8fee34de7b": {
      title: "Système de refroidissement intégré",
      description: "Un radiateur haute capacité, un grand ventilateur réversible et un refroidisseur d'huile maintiennent votre chargeur en fonctionnement plus longtemps à des températures plus basses."
    },
    "6fac5a12-01ee-44df-92ed-9d37e91f4df2": {
      title: "Hydraulique à super débit",
      description: "Cette option hydraulique auxiliaire s'attaque aux travaux les plus exigeants avec des accessoires nécessitant le débit le plus élevé possible à 159 l/min et 280 bar."
    },
    "02bdfbd9-fc81-40bb-84c0-bdb27ac6f683": {
      title: "Compagnon de chantier",
      description: "Les fonctions optionnelles activées par la voix, les réglages spécifiques aux accessoires et les informations en temps réel aident les opérateurs à travailler plus vite sans arrêter la machine."
    },
    "2fba9efa-159a-437e-a5de-95ab86d0f22e": {
      title: "Détection des personnes à 360°",
      description: "Option qui détecte les personnes autour de la machine et aide à donner aux opérateurs une meilleure conscience de leur environnement sur les chantiers animés."
    }
  },
  es: {
    "9f6157ae-10a6-4c25-aa25-df2885ebbcae": {
      title: "Controles de joystick seleccionables",
      description: "Control manual de bajo esfuerzo de todas las funciones del grupo de trabajo de la máquina y la capacidad de cambiar entre los patrones de control ISO y H."
    },
    "6d4f81d9-47d9-4e38-857a-1e8fee34de7b": {
      title: "Sistema de enfriamiento integrado",
      description: "Un radiador de alta capacidad, un gran ventilador reversible y un enfriador de aceite mantienen su cargador funcionando más tiempo a temperaturas más bajas."
    },
    "6fac5a12-01ee-44df-92ed-9d37e91f4df2": {
      title: "Hidráulica de super flujo",
      description: "Esta opción hidráulica auxiliar aborda los trabajos más exigentes con accesorios que requieren el mayor caudal posible a 159 l/min y 280 bar."
    },
    "02bdfbd9-fc81-40bb-84c0-bdb27ac6f683": {
      title: "Compañero de obra",
      description: "Las funciones opcionales activadas por voz, la configuración específica de accesorios y los datos en tiempo real ayudan a los operadores a trabajar más rápido sin detener la máquina."
    },
    "2fba9efa-159a-437e-a5de-95ab86d0f22e": {
      title: "Detección de personas a 360°",
      description: "Opción que detecta personas alrededor de la máquina y ayuda a dar a los operadores mayor conciencia situacional en condiciones de obra concurridas."
    }
  },
  de: {
    "9f6157ae-10a6-4c25-aa25-df2885ebbcae": {
      title: "Wählbare Joystick-Steuerung",
      description: "Mühelose Handsteuerung aller Maschinenarbeitsgruppenfunktionen und die Möglichkeit, zwischen ISO- und H-Steuerungsmustern zu wechseln."
    },
    "6d4f81d9-47d9-4e38-857a-1e8fee34de7b": {
      title: "Integriertes Maschinenkühlung-System",
      description: "Ein Hochleistungskühler, ein großer umkehrbarer Lüfter und ein Ölkühler sorgen dafür, dass Ihr Lader länger bei niedrigeren Temperaturen läuft."
    },
    "6fac5a12-01ee-44df-92ed-9d37e91f4df2": {
      title: "Super-Flow-Hydraulik",
      description: "Diese Zusatzhydraulikoption bewältigt die anspruchsvollsten Arbeiten mit Anbaugeräten, die den höchstmöglichen Durchfluss von 159 l/min und 280 bar erfordern."
    },
    "02bdfbd9-fc81-40bb-84c0-bdb27ac6f683": {
      title: "Baustellen-Assistent",
      description: "Optionale sprachgesteuerte Maschinenfunktionen, anbaugerätespezifische Einstellungen und Echtzeit-Einblicke helfen Bedienern, schneller zu arbeiten, ohne die Maschine anzuhalten."
    },
    "2fba9efa-159a-437e-a5de-95ab86d0f22e": {
      title: "360°-Personenerkennung",
      description: "Option, die Personen rund um die Maschine erkennt und Bedienern auf belebten Baustellen ein erhöhtes Situationsbewusstsein gibt."
    }
  }
};

// ── 1. Authenticate ───────────────────────────────────────────────────────────
console.log("Authenticating...");
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
// Token is usually at response.token or response.data.token — try both
const token = authData?.response?.token ?? authData?.token ?? authData?.data?.token;
if (!token) {
  console.error("Could not find token in auth response:", JSON.stringify(authData, null, 2));
  process.exit(1);
}
console.log("✓ Authenticated");

// ── 2. Fetch full product from platform API ───────────────────────────────────
console.log("Fetching product...");
const getRes = await fetch(
  `${PUBLIC}/products/${UUID}/organizations/${ORG}/clients/${WS}`
);
const product = (await getRes.json()).response;
console.log(`✓ Got product: ${product.name}`);

// ── 3. Upsert the hotspot_translations attribute ──────────────────────────────
const ATTR_KEY = "hotspot_translations";
const attrs = (product.attributes ?? []).filter(a => a.name !== ATTR_KEY);
attrs.push({
  name: ATTR_KEY,
  value: JSON.stringify(TRANSLATIONS)
});
product.attributes = attrs;
console.log(`✓ Merged translations (${Object.keys(TRANSLATIONS).length} locales, ${Object.keys(TRANSLATIONS.fr).length} hotspots each)`);

// ── 4. PUT product back via platform API ──────────────────────────────────────
console.log("Writing to platform...");
const putRes = await fetch(`${PLATFORM}/v1/products`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    uuid: UUID,
    organizationSlug: ORG,
    clientSlug: WS,
    ...product
  })
});

if (!putRes.ok) {
  console.error("PUT failed:", putRes.status, await putRes.text());
  process.exit(1);
}

const putData = await putRes.json();
console.log("✓ Written. Verifying...");

// ── 5. Verify by reading back from public API ─────────────────────────────────
const verifyRes = await fetch(`${PUBLIC}/products/${UUID}/organizations/${ORG}/clients/${WS}`);
const verified  = (await verifyRes.json()).response;
const writtenAttr = verified.attributes?.find(a => a.name === ATTR_KEY);

if (writtenAttr) {
  const parsed = JSON.parse(writtenAttr.value);
  const locales = Object.keys(parsed);
  console.log(`✓ Verified — public API now returns translations for: ${locales.join(", ")}`);
  console.log("  Sample FR hotspot 1:", parsed.fr?.["9f6157ae-10a6-4c25-aa25-df2885ebbcae"]?.title);
} else {
  console.warn("⚠ Attribute not visible in public API yet — may take a moment to propagate.");
}

console.log("\nDone. Update hotspot-translations.html to read from product attributes instead of hardcoded JS.");
