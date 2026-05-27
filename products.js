// Central product registry — add new Live Public products here
export const BASE_URL = "https://api.vntana.com";

export const PRODUCTS = [
  {
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
