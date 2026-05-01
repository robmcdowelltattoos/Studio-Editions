// lib/products.js
// Single source of truth for all product data and pricing.
// Prices are in CENTS. This file is imported by both the
// frontend (for display) and the API routes (for validation).

export const PRODUCTS = {
  gold: {
    key: 'gold',
    title: 'Gold',
    subtitle: 'Figurative · Oils on black ground',
    edition: 'Edition of 50',
    medium: 'Archival pigment giclée',
    paper: 'Hahnemühle Photo Rag 308gsm',
    originalSize: '36 × 40 inches',
    description:
      'A figure dissolves into and emerges from liquid gold — the boundary between skin and metal rendered indistinct. Painted in oils on a deep black ground, the work explores transformation, alchemy, and the weight of adornment.',
    image: '/prints/gold.jpg',
    aspectRatio: '3/4',
    sizes: [
      { key: '12x14',  label: '12 × 14 in', cents: 12000 },
      { key: '18x21',  label: '18 × 21 in', cents: 20000 },
      { key: '24x28',  label: '24 × 28 in', cents: 32000 },
      { key: '30x35',  label: '30 × 35 in', cents: 48000 },
    ],
  },
  dragon: {
    key: 'dragon',
    title: 'Encounter',
    subtitle: 'Figurative · Oils on linen',
    edition: 'Edition of 30',
    medium: 'Archival pigment giclée',
    paper: 'Hahnemühle Photo Rag 308gsm',
    originalSize: '72 × 40 inches',
    description:
      'A lone figure stands before an ancient dragon in a snowbound mountain pass, a blade of light the only warmth against the cold. Painted at monumental scale — 72 × 40 inches — the work draws on the tradition of epic painting while reaching toward something more personal: the moment before an irreversible choice.',
    image: '/prints/dragon.jpg',
    aspectRatio: '16/9',
    sizes: [
      { key: '18x10',  label: '18 × 10 in', cents: 18000 },
      { key: '36x20',  label: '36 × 20 in', cents: 30000 },
      { key: '48x27',  label: '48 × 27 in', cents: 46000 },
      { key: '60x33',  label: '60 × 33 in', cents: 64000 },
    ],
  },
}

// Flat price lookup used by the API to validate amounts server-side
export const PRICE_MAP = Object.fromEntries(
  Object.values(PRODUCTS).flatMap(p =>
    p.sizes.map(s => [`${p.key}-${s.key}`, s.cents])
  )
)
// Result: { 'gold-12x14': 12000, 'gold-18x21': 20000, ... }
