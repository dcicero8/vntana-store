// Central product registry — add new Live Public products here.
// type: "product"       → single product, uuid = product UUID
// type: "variant-group" → multiple colorways, uuid = variant group UUID
export const BASE_URL = "https://api.vntana.com";

export const PRODUCTS = [
  {
    type: "variant-group",
    uuid: "080a7f32-c744-4cc9-8fb3-a0fa7755c69d",
    org: "DCicero",
    workspace: "example-files",
    catalogThumbnailUuid: "b026d841-8699-4d85-9f62-4f859fe35cb1", // Blue jacket
    name: "VNTANA Full-Zip Jacket",
    subtitle: "Performance technical jacket in three colorways",
    price: "$189.00",
    category: "Apparel",
    breadcrumb: "Apparel › Jackets",
    description:
      "Engineered for movement. The VNTANA Full-Zip is built from recycled performance fabric with a 4-way stretch that moves with you. Rotate it in 3D or try AR to see how it fits before you buy.",
    features: [
      "Recycled 94% polyester / 6% elastane shell",
      "4-way stretch with moisture-wicking lining",
      "YKK water-resistant front zip",
      "Available in Blue, White, and Black",
    ],
    // Color swatches mapped by the name fragment in each variant's product name
    colorMap: { Blue: "#1a5fa8", White: "#f0f0f0", Black: "#1a1a1a" },
  },
  {
    type: "product",
    uuid: "ca4aebfc-ebc6-4e79-b4e7-8ce4bca4d58d",
    org: "DCicero",
    workspace: "example-files",
    name: "Orbit Stroller",
    subtitle: "Lightweight all-terrain frame with one-hand fold",
    price: "$899.00",
    category: "Baby",
    breadcrumb: "Baby › Strollers",
    description:
      "The Orbit is engineered for parents who move fast. A featherlight aluminum chassis, all-terrain wheels, and a one-hand fold that actually works — explore every detail in 3D, or tap AR to see it in your hallway before you buy.",
    features: [
      "Aerospace-grade aluminum frame — 14.2 lbs",
      "All-terrain foam-filled tires, no flats ever",
      "One-hand fold, self-stands when folded",
      "UPF 50+ canopy with peek-a-boo window",
    ],
    variants: [
      { label: "Midnight Black" },
      { label: "Slate Grey" },
      { label: "Sand Beige" },
    ],
  },
  {
    type: "product",
    uuid: "bd018ea1-c331-431d-bce8-5d9e6967f8ca",
    org: "DCicero",
    workspace: "example-files",
    name: "Forma Sectional",
    subtitle: "Modern L-shaped sofa in performance fabric",
    price: "$2,499.00",
    category: "Furniture",
    breadcrumb: "Furniture › Sofas & Sectionals",
    description:
      "The Forma redefines living room comfort with deep seating and clean lines. Rotate it in 3D to find the perfect configuration, or tap AR to see exactly how it fits your space before it ships.",
    features: [
      "High-density foam with fiber-wrap cushions",
      "Performance fabric — stain and pet resistant",
      "Modular design, configures left or right",
      "Ships in 2 boxes, assembles in under 30 min",
    ],
    variants: [
      { label: "Pebble Grey" },
      { label: "Warm Oat" },
      { label: "Slate Blue" },
    ],
  },
];
