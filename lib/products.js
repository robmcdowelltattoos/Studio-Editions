// lib/products.js
export const PRODUCTS = {
  gold: {
    key: 'gold',
    title: 'The Weight of Gold',
    subtitle: 'Figurative · Oils on black ground',
    edition: 'Edition of 50',
    medium: 'Archival pigment giclée',
    originalSize: '36 × 48 inches',
    description:
      'A figure dissolves into and emerges from liquid gold — the boundary between skin and metal rendered indistinct. Painted in oils on a deep black ground, the work explores transformation, alchemy, and the weight of adornment.',
    images: [
      '/prints/gold.jpg',
      '/prints/gold-mockup-1.jpg',
      '/prints/gold-mockup-2.jpg',
    ],
    aspectRatio: '3/4',
    sizes: [
      {
        key: 'small-12x16',
        label: 'Small',
        dimensions: '12 × 16 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 6500  },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 17500 },
          { key: 'wc',        label: 'Fine Art Watercolour Paper',        cents: 6000  },
        ],
      },
      {
        key: 'medium-18x24',
        label: 'Medium',
        dimensions: '18 × 24 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 15000 },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 31000 },
          { key: 'wc',        label: 'Fine Art Watercolour Paper',        cents: 13000 },
        ],
      },
      {
        key: 'large-24x30',
        label: 'Large',
        dimensions: '24 × 30 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 25000 },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 45000 },
          { key: 'wc',        label: 'Fine Art Watercolour Paper',        cents: 22000 },
        ],
      },
      {
        key: 'xl-30x40',
        label: 'XL',
        dimensions: '30 × 40 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 41500 },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 67500 },
          { key: 'wc',        label: 'Fine Art Watercolour Paper',        cents: 36500 },
        ],
      },
      {
        key: 'original-36x48',
        label: 'Original',
        dimensions: '36 × 48 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 59500 },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 91000 },
        ],
      },
    ],
  },

  dragon: {
    key: 'dragon',
    title: 'The Ancient',
    subtitle: 'Figurative · Oils on linen',
    edition: 'Edition of 30',
    medium: 'Archival pigment giclée',
    originalSize: '40 × 72 inches',
    description:
      'A lone figure stands before an ancient dragon in a snowbound mountain pass, a blade of light the only warmth against the cold. Painted at monumental scale — 40 × 72 inches — the work draws on the tradition of epic painting while reaching toward something more personal: the moment before an irreversible choice.',
    images: [
      '/prints/dragon.jpg',
      '/prints/dragon-mockup-1.jpg',
      '/prints/dragon-mockup-2.jpg',
      '/prints/dragon-mockup-3.jpg',
    ],
    aspectRatio: '16/9',
    sizes: [
      {
        key: 'small-15x27',
        label: 'Small',
        dimensions: '15 × 27 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 14000 },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 30000 },
          { key: 'wc',        label: 'Fine Art Watercolour Paper',        cents: 12500 },
        ],
      },
      {
        key: 'medium-20x36',
        label: 'Medium',
        dimensions: '20 × 36 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 25000 },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 45000 },
          { key: 'wc',        label: 'Fine Art Watercolour Paper',        cents: 22000 },
        ],
      },
      {
        key: 'large-25x45',
        label: 'Large',
        dimensions: '25 × 45 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 39000 },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 65000 },
          { key: 'wc',        label: 'Fine Art Watercolour Paper',        cents: 34500 },
        ],
      },
      {
        key: 'xl-30x54',
        label: 'XL',
        dimensions: '30 × 54 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 55500 },
          { key: 'stretched', label: 'Satin Giclée — Stretched & Wired', cents: 87000 },
          { key: 'wc',        label: 'Fine Art Watercolour Paper',        cents: 49500 },
        ],
      },
      {
        key: 'original-40x72',
        label: 'Original',
        dimensions: '40 × 72 in',
        materials: [
          { key: 'canvas',    label: 'Satin Giclée — Unframed',          cents: 99000  },
          {
            key: 'stretched',
            label: 'Satin Giclée — Stretched & Wired',
            cents: 151000,
            warning: 'Due to its size, this option qualifies as oversized shipping which may add $400–$500 to your order. Our supplier recommends purchasing Canvas Unframed and having a local art store stretch and wire it to avoid this cost.',
          },
        ],
      },
    ],
  },
}

// Flat price map for server-side validation — key: `productKey-sizeKey-materialKey`
export const PRICE_MAP = Object.fromEntries(
  Object.values(PRODUCTS).flatMap(p =>
    p.sizes.flatMap(s =>
      s.materials.map(m => [`${p.key}-${s.key}-${m.key}`, m.cents])
    )
  )
)
