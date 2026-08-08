/*
  Keyword vocabulary + response phrase banks for the rule-based ZÉVON AI
  engine. Kept separate from aiEngine.js's logic so the "personality" and
  vocabulary can be tuned without touching the matching/scoring code.
*/

export const MOOD_KEYWORDS = {
  dark: ['dark', 'black', 'shadow', 'shadowy', 'moody', 'blacked out', 'noir', 'darker'],
  minimal: [
    'minimal',
    'minimalist',
    'clean',
    'simple',
    'understated',
    'plain',
    'pared back',
    'pared-back',
    'basic',
    'no frills',
  ],
  rebellious: ['rebellious', 'rebel', 'edgy', 'punk', 'defiant', 'anti', 'grunge', 'rough'],
  elegant: [
    'elegant',
    'classy',
    'refined',
    'sophisticated',
    'polished',
    'sharp',
    'dapper',
    'smart',
    'formal',
  ],
  night: ['night', 'evening', 'after dark', 'late night', 'nighttime', 'nocturnal'],
  raw: ['raw', 'rugged', 'unfinished', 'industrial', 'utility', 'gritty', 'tough', 'workwear'],
  confident: [
    'confident',
    'bold',
    'statement',
    'loud',
    'powerful',
    'commanding',
    'strong',
    'fearless',
    'standout',
  ],
  'quiet-luxury': [
    'quiet luxury',
    'expensive',
    'luxury',
    'subtle',
    'low-key',
    'lowkey',
    'understated luxury',
    'rich',
    'premium',
    'high end',
    'high-end',
    'classy but subtle',
  ],
};

export const OCCASION_KEYWORDS = {
  'date-night': ['date night', 'date', 'romantic', 'first date'],
  party: ['party', 'club', 'rave', 'night out', 'going out', 'clubbing', 'lit night'],
  casual: [
    'casual',
    'everyday wear',
    'chill',
    'hang out',
    'hangout',
    'weekend',
    'errands',
    'relaxing',
  ],
  dinner: ['dinner', 'restaurant', 'brunch', 'lunch'],
  event: ['event', 'launch', 'gala', 'fashion show', 'opening', 'red carpet', 'premiere'],
  everyday: ['everyday', 'daily', 'day to day', 'day-to-day', 'work', 'office', 'school'],
  'just-because': ['just because', 'no reason', 'treat myself', 'spoil myself'],
  travel: ['travel', 'flight', 'airport', 'trip', 'vacation', 'holiday'],
};

// First match wins per silhouette bucket — order matters slightly less than
// coverage here since aiEngine applies negation scoring on top of this.
export const SILHOUETTE_KEYWORDS = {
  oversized: ['oversized', 'baggy', 'boxy', 'roomy', 'loose', 'big'],
  fitted: ['fitted', 'slim', 'tight', 'close-fitting', 'close fitting', 'snug', 'skinny'],
  tailored: ['tailored', 'structured', 'sharp cut', 'crisp'],
  relaxed: ['relaxed', 'comfortable', 'comfy', 'easy', 'laid back', 'laid-back'],
  streamlined: ['streamlined', 'sleek', 'lean'],
  tapered: ['tapered', 'narrow at the ankle'],
};

// Category keywords used both for silhouette-triggered swaps ("change the
// jacket"), for parsing "what would go with my black hoodie," and for direct
// category browsing ("show me hoodies").
export const CATEGORY_KEYWORDS = {
  Outerwear: ['jacket', 'coat', 'outerwear', 'shell', 'parka', 'windbreaker', 'blazer'],
  Hoodies: ['hoodie', 'hood', 'hoodies', 'sweatshirt', 'pullover'],
  'T-Shirts': ['tee', 't-shirt', 'tshirt', 'shirt', 'top', 'tees', 't-shirts', 'shirts'],
  Bottoms: ['pants', 'trousers', 'cargo', 'bottoms', 'jeans', 'sweatpants', 'joggers', 'shorts'],
  Accessories: ['cap', 'hat', 'ring', 'accessory', 'accessories', 'beanie', 'jewelry', 'jewellery'],
};

export const COLOR_KEYWORDS = ['black', 'gold', 'off-white', 'white', 'gunmetal', 'grey', 'gray', 'cream'];

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
  cheaper: ['cheaper', 'less expensive', 'budget', 'affordable', 'lower price', 'cheap'],
  expensive: ['expensive', 'premium', 'splurge', 'higher end', 'high end'],
};

export const REFINEMENT_MOOD_BOOST = ['more', 'darker', 'more minimal', 'more elegant', 'more rebellious'];

// "Show me hoodies" / "do you have jackets" — direct category browsing,
// distinct from the mood/occasion-scored recommendation path.
export const CATEGORY_BROWSE_TRIGGERS = [
  'show me',
  'do you have',
  'got any',
  'have any',
  'what do you have in',
  'see your',
  'browse',
  'looking for',
];

// "What do you have" / "show me everything" — browse the whole catalog.
export const CATALOG_BROWSE_TRIGGERS = [
  'everything',
  'entire collection',
  'whole collection',
  'full collection',
  'all your products',
  'all your pieces',
  'all your items',
  'what do you have',
  'what do you sell',
  "what's in stock",
  'whats in stock',
  'browse the collection',
  'see the collection',
  'show me the collection',
  'show me everything',
];

// "Tell me about the shadow hoodie" / "what's it made of" — a specific
// product's description and details, rather than a recommendation list.
export const PRODUCT_DETAIL_TRIGGERS = [
  'tell me about',
  'details on',
  'more about',
  'what is it made of',
  "what's it made of",
  'what is that made of',
  'material',
  'fabric',
  'what sizes',
  'tell me more',
  'more details',
  'more info',
];

// "Show me more" / "anything else" — re-roll the last set of
// recommendations, excluding what's already been shown.
export const MORE_TRIGGERS = [
  'show me more',
  'more options',
  'other options',
  'anything else',
  'what else',
  'something else',
  'more like this',
  'more choices',
];

export const CATEGORY_BROWSE_INTROS = [
  (category) => `Here's what we have in ${category}.`,
  (category) => `Everything currently in ${category}:`,
];

export const CATALOG_INTROS = [
  'Here’s a spread across the collection.',
  'A look across everything we carry right now.',
];

export const MORE_INTROS = ['A few more worth a look.', 'Here are some others.', 'More from the collection.'];

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

/* Small talk — matched as a standalone message (see GREETING_PATTERN etc. in
   aiEngine.js), so these fire on a bare "hi" without hijacking real style
   requests that merely contain the same letters (e.g. "shirt"). */
export const CASUAL_GREETING_REPLIES = [
  "Hey! I'm ZÉVON AI, your personal stylist. Tell me an occasion, a mood, or something you already own, and I'll take it from there.",
  "Hi there — happy to help you find something. What's the occasion, or how do you want to feel?",
  "Hello! Give me a vibe, an occasion, or a budget and I'll pull pieces for you.",
];

export const THANKS_REPLIES = [
  "Anytime — let me know if you want another look.",
  "Of course. Happy to keep going if you want more options.",
  "You're welcome. I'm here if you need anything else.",
];

export const IDENTITY_REPLIES = [
  "I'm ZÉVON AI, your personal stylist. I can build a full outfit, compare two pieces, or recommend by mood, occasion, or budget — just tell me what you need.",
  "I'm your stylist here at ZÉVON. Describe a vibe, an occasion, or a piece you already own, and I'll build around it.",
];

export const FAREWELL_REPLIES = [
  "Take care — come back anytime you need a look put together.",
  "See you. I'll be here when you're ready for the next fit.",
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
