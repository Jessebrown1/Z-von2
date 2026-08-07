/*
  Keyword vocabulary + response phrase banks for the rule-based ZÉVON AI
  engine. Kept separate from aiEngine.js's logic so the "personality" and
  vocabulary can be tuned without touching the matching/scoring code.
*/

export const MOOD_KEYWORDS = {
  dark: ['dark', 'black', 'shadow', 'shadowy', 'moody', 'blacked out'],
  minimal: ['minimal', 'minimalist', 'clean', 'simple', 'understated', 'plain', 'pared back', 'pared-back'],
  rebellious: ['rebellious', 'rebel', 'edgy', 'punk', 'defiant', 'anti'],
  elegant: ['elegant', 'classy', 'refined', 'sophisticated', 'polished', 'sharp'],
  night: ['night', 'evening', 'after dark', 'late night', 'nighttime'],
  raw: ['raw', 'rugged', 'unfinished', 'industrial', 'utility', 'gritty'],
  confident: ['confident', 'bold', 'statement', 'loud', 'powerful', 'commanding'],
  'quiet-luxury': [
    'quiet luxury',
    'expensive',
    'luxury',
    'subtle',
    'low-key',
    'lowkey',
    'understated luxury',
    'rich',
  ],
};

export const OCCASION_KEYWORDS = {
  'date-night': ['date night', 'date', 'romantic'],
  party: ['party', 'club', 'rave', 'night out', 'going out'],
  casual: ['casual', 'everyday wear', 'chill', 'hang out', 'hangout'],
  dinner: ['dinner', 'restaurant'],
  event: ['event', 'launch', 'gala', 'show', 'opening'],
  everyday: ['everyday', 'daily', 'day to day', 'day-to-day'],
  'just-because': ['just because', 'no reason', 'treat myself'],
};

// First match wins per silhouette bucket — order matters slightly less than
// coverage here since aiEngine applies negation scoring on top of this.
export const SILHOUETTE_KEYWORDS = {
  oversized: ['oversized', 'baggy', 'boxy', 'roomy'],
  fitted: ['fitted', 'slim', 'tight', 'close-fitting', 'close fitting'],
  tailored: ['tailored', 'structured'],
  relaxed: ['relaxed', 'comfortable', 'comfy', 'easy'],
  streamlined: ['streamlined', 'sleek'],
  tapered: ['tapered'],
};

// Category keywords used both for silhouette-triggered swaps ("change the
// jacket") and for parsing "what would go with my black hoodie."
export const CATEGORY_KEYWORDS = {
  Outerwear: ['jacket', 'coat', 'outerwear', 'shell'],
  Hoodies: ['hoodie', 'hood'],
  'T-Shirts': ['tee', 't-shirt', 'tshirt', 'shirt', 'top'],
  Bottoms: ['pants', 'trousers', 'cargo', 'bottoms', 'jeans'],
  Accessories: ['cap', 'hat', 'ring', 'accessory', 'accessories'],
};

export const COLOR_KEYWORDS = ['black', 'gold', 'off-white', 'white', 'gunmetal'];

export const OUTFIT_TRIGGERS = [
  'build me a fit',
  'build my look',
  'build a look',
  'complete look',
  'complete outfit',
  'full look',
  'give me a look',
  'give me an outfit',
  'style me',
  'what should i wear',
  'put together a look',
  'fit check',
];

export const COMPARISON_TRIGGERS = [
  'which one should i get',
  'which should i choose',
  'which one should i choose',
  'which is better',
  'compare',
  ' vs ',
  ' versus ',
  'help me choose',
  'help me decide',
];

export const STRETCH_TRIGGERS = [
  'something new',
  'find me something new',
  'surprise me',
  'push my style',
  'outside my usual',
];

export const PRICE_KEYWORDS = {
  cheaper: ['cheaper', 'less expensive', 'budget', 'affordable', 'lower price'],
  expensive: ['expensive', 'premium', 'splurge', 'higher end', 'high end'],
};

export const REFINEMENT_MOOD_BOOST = ['more', 'darker', 'more minimal', 'more elegant', 'more rebellious'];

export const CHANGE_SLOT_PATTERN = /change the (jacket|top|hoodie|tee|shirt|bottom|pants|trousers|accessory|cap|ring)/;

export const SLOT_ALIASES = {
  jacket: 'jacket',
  hoodie: 'top',
  tee: 'top',
  shirt: 'top',
  top: 'top',
  bottom: 'bottom',
  pants: 'bottom',
  trousers: 'bottom',
  accessory: 'accessory',
  cap: 'accessory',
  ring: 'accessory',
};

export const GREETINGS = [
  "I'm ZÉVON AI — your personal stylist. Tell me what you're looking for, or how you want to feel.",
  "Hey — I'm ZÉVON AI. Describe an occasion, a mood, or a piece you already own, and I'll build from there.",
];

export const OUTFIT_INTROS = [
  (moodLabel) => (moodLabel ? `For ${moodLabel.toLowerCase()}, I'd keep it sharp and intentional.` : "Here's a look I'd build for you."),
  (moodLabel) => (moodLabel ? `Here's a look I'd build around ${moodLabel.toLowerCase()}.` : "Here's a full look, put together."),
  (moodLabel) => (moodLabel ? `${moodLabel} calls for something considered — here's the fit.` : "Here's the fit."),
];

export const PRODUCT_INTROS = [
  (moodLabel) => (moodLabel ? `Leaning ${moodLabel.toLowerCase()}, here's what I'd pull.` : "Here's what I'd point you toward."),
  (moodLabel) => (moodLabel ? `For something ${moodLabel.toLowerCase()}, these stand out.` : 'A few pieces worth a look.'),
  () => 'Here are a few that fit the brief.',
];

export const NO_MATCH_INTROS = [
  "I don't have a piece that matches that exactly yet — here's the closest thing in the collection.",
  "Nothing's a perfect match for that, but here's what gets closest.",
];

export const REFINEMENT_ACKS = ['Got it — adjusting.', 'Noted, let me pull something closer to that.', 'Understood — one moment.'];

export const COMPLEMENT_INTROS = [
  (piece) => `Built around your ${piece}, here's a look that keeps the same energy.`,
  (piece) => `To go with your ${piece}, I'd add these.`,
];

export const STRETCH_INTROS = ["You usually lean a certain way — here's something worth stepping outside that for."];

export const OUTFIT_BUILDER_ASK_OCCASION = "What's the occasion?";
export const OUTFIT_BUILDER_ASK_MOOD = "And what's the mood?";
