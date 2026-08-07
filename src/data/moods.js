/*
  The 8 moods ZÉVON AI and Mood Shopping both key off of. `tag` must match
  the values used in a product's moodTags (server/src/db.js DNA_BACKFILL and
  the admin Product DNA fields) — this file and the backend tag vocabulary
  are the same contract, kept in sync by hand.
*/
export const moods = [
  {
    slug: 'dark',
    tag: 'dark',
    label: 'Dark',
    tagline: 'Shadow-first, nothing loud.',
    description: 'Silhouettes that disappear into low light. Black on black, kept sharp.',
    accent: '#1a1a1a',
    glow: 'rgba(120, 120, 130, 0.25)',
  },
  {
    slug: 'minimal',
    tag: 'minimal',
    label: 'Minimal',
    tagline: 'Nothing extra. Nothing missing.',
    description: 'Clean lines, quiet construction — the kind of restraint that reads as confidence.',
    accent: '#2a2a26',
    glow: 'rgba(201, 169, 97, 0.18)',
  },
  {
    slug: 'rebellious',
    tag: 'rebellious',
    label: 'Rebellious',
    tagline: 'Built to break the pattern.',
    description: 'Utility hardware, raw edges, pieces that don’t ask permission.',
    accent: '#241414',
    glow: 'rgba(180, 90, 70, 0.2)',
  },
  {
    slug: 'elegant',
    tag: 'elegant',
    label: 'Elegant',
    tagline: 'Quietly, unmistakably refined.',
    description: 'Tailored shells and considered detail — the kind of piece that does the talking for you.',
    accent: '#1c1a14',
    glow: 'rgba(232, 201, 138, 0.22)',
  },
  {
    slug: 'night',
    tag: 'night',
    label: 'Night',
    tagline: 'Made for after dark.',
    description: 'Pieces that hold their shape from last light to last call.',
    accent: '#0d0d12',
    glow: 'rgba(90, 100, 160, 0.18)',
  },
  {
    slug: 'raw',
    tag: 'raw',
    label: 'Raw',
    tagline: 'Unfinished on purpose.',
    description: 'Heavyweight fabrics, structural stitching left visible — nothing softened.',
    accent: '#1e1a16',
    glow: 'rgba(160, 120, 80, 0.2)',
  },
  {
    slug: 'confident',
    tag: 'confident',
    label: 'Confident',
    tagline: 'Takes up exactly the space it means to.',
    description: 'Statement proportions and hardware that catches the light without asking for it.',
    accent: '#211c14',
    glow: 'rgba(201, 169, 97, 0.28)',
  },
  {
    slug: 'quiet-luxury',
    tag: 'quiet-luxury',
    label: 'Quiet Luxury',
    tagline: 'Expensive, never loud about it.',
    description: 'The weight of the fabric does the work — no logo required.',
    accent: '#18160f',
    glow: 'rgba(232, 201, 138, 0.16)',
  },
];

export function getMoodByTag(tag) {
  return moods.find((m) => m.tag === tag);
}
