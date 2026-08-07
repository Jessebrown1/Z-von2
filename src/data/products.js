/*
  Single source of truth for every product on the site.
  Add, remove, or edit products here — pages and components read from this file only.

  images: paths are resolved from /public, so drop new photography in
  public/products/<slug>/ and point to it as '/products/<slug>/01.jpg'.
  Until real photography is in, products fall back to the placeholder hero art.
*/

const PLACEHOLDER_IMAGE = '/hero.png';

export const collections = [
  {
    slug: 'fearless',
    name: 'The Fearless Collection',
    description: 'No. 001 — the founding drop. 500 pieces, numbered, never repeated.',
  },
];

export const products = [
  {
    id: 'zevon-shadow-hoodie',
    slug: 'shadow-hoodie',
    name: 'ZÉVON Shadow Hoodie',
    collection: 'fearless',
    category: 'Hoodies',
    price: 3750,
    currency: 'GHS',
    isNew: true,
    isLimited: true,
    editionSize: 500,
    description:
      "Heavyweight fleece cut for movement, not silhouette. Garment-dyed for depth, finished with a gold foil mark that catches light at the seam.",
    details: [
      '480gsm brushed cotton fleece',
      'Garment-dyed, enzyme washed',
      'Foil-embossed ZÉVON mark',
      'Made in limited batches of 500',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gold'],
    images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
  },
  {
    id: 'zevon-midnight-tee',
    slug: 'midnight-tee',
    name: 'ZÉVON Midnight Tee',
    collection: 'fearless',
    category: 'T-Shirts',
    price: 1425,
    currency: 'GHS',
    isNew: false,
    isLimited: true,
    editionSize: 500,
    description:
      'A second-skin tee in triple-mercerized cotton. Cut close, hemmed heavy, built to outlast the season.',
    details: [
      '220gsm mercerized cotton',
      'Reinforced collar band',
      'Tonal woven label',
      'Made in limited batches of 500',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Off-White'],
    images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
  },
  {
    id: 'zevon-relic-cargo',
    slug: 'relic-cargo',
    name: 'ZÉVON Relic Cargo',
    collection: 'fearless',
    category: 'Bottoms',
    price: 4800,
    currency: 'GHS',
    isNew: true,
    isLimited: true,
    editionSize: 500,
    description:
      'Utility cargo reworked in structured twill. Gold hardware, articulated knee, tapered from thigh to ankle.',
    details: [
      '14oz cotton twill',
      'Brushed-gold hardware',
      'Articulated knee construction',
      'Made in limited batches of 500',
    ],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Black'],
    images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
  },
  {
    id: 'zevon-obsidian-jacket',
    slug: 'obsidian-jacket',
    name: 'ZÉVON Obsidian Jacket',
    collection: 'fearless',
    category: 'Outerwear',
    price: 7200,
    currency: 'GHS',
    isNew: false,
    isLimited: true,
    editionSize: 250,
    description:
      'Bonded shell with a fully quilted lining. Storm flap, magnetic placket, one piece per two owners on average.',
    details: [
      'Bonded technical shell, DWR finish',
      'Quilted satin lining',
      'Magnetic storm placket',
      'Made in limited batches of 250',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gunmetal'],
    images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
  },
  {
    id: 'zevon-gold-cap',
    slug: 'gold-cap',
    name: 'ZÉVON Gold Line Cap',
    collection: 'fearless',
    category: 'Accessories',
    price: 975,
    currency: 'GHS',
    isNew: false,
    isLimited: false,
    editionSize: null,
    description:
      'Six-panel structured cap with a single hand-embroidered gold line. Understated, everywhere.',
    details: [
      'Structured six-panel construction',
      'Hand embroidered gold line detail',
      'Adjustable brass clasp',
    ],
    sizes: ['One Size'],
    colors: ['Black'],
    images: [PLACEHOLDER_IMAGE],
  },
  {
    id: 'zevon-signet-ring',
    slug: 'signet-ring',
    name: 'ZÉVON Signet Ring',
    collection: 'fearless',
    category: 'Accessories',
    price: 2700,
    currency: 'GHS',
    isNew: true,
    isLimited: true,
    editionSize: 500,
    description:
      'Cast in brass, finished in a warm gold plate. The ZÉVON mark, worn as a signature.',
    details: [
      'Brass base, 18k gold plate',
      'Hand-finished edges',
      'Individually numbered',
      'Made in limited batches of 500',
    ],
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['Gold'],
    images: [PLACEHOLDER_IMAGE],
  },
];

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id) {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(category) {
  if (!category || category === 'All') return products;
  return products.filter((product) => product.category === category);
}

export function getCategories() {
  return ['All', ...new Set(products.map((product) => product.category))];
}

export function getRelatedProducts(product, limit = 3) {
  return products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, limit);
}
