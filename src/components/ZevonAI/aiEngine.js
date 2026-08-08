/*
  Rule-based natural-language engine behind ZÉVON AI. No external API calls —
  everything here is deterministic keyword/intent matching plus weighted
  product scoring against the already-loaded catalog. Kept as pure functions
  (no React) so it's testable and reusable from both the chat and the
  Outfit Builder quick-flow.
*/
import {
  MOOD_KEYWORDS,
  OCCASION_KEYWORDS,
  SILHOUETTE_KEYWORDS,
  CATEGORY_KEYWORDS,
  COLOR_KEYWORDS,
  OUTFIT_TRIGGERS,
  COMPARISON_TRIGGERS,
  STRETCH_TRIGGERS,
  PRICE_KEYWORDS,
  CHANGE_SLOT_PATTERN,
  SLOT_ALIASES,
  GREETINGS,
  CASUAL_GREETING_REPLIES,
  THANKS_REPLIES,
  IDENTITY_REPLIES,
  FAREWELL_REPLIES,
  OUTFIT_INTROS,
  PRODUCT_INTROS,
  NO_MATCH_INTROS,
  REFINEMENT_ACKS,
  COMPLEMENT_INTROS,
  STRETCH_INTROS,
} from './keywordData';

// Matched against the whole message (not a substring), so a bare "hi" or
// "thanks" gets a conversational reply instead of being run through the
// product-matching pipeline — where it would find no keyword hits and fall
// back to dumping random products.
const GREETING_PATTERN = /^(hi+|hello+|hey+|hiya|yo|sup|howdy|greetings|good\s?(morning|afternoon|evening)|what'?s\s+up)\b[\s!.,]*(there|zevon|zévon)?[\s!.,]*$/i;
const THANKS_PATTERN = /^(thanks|thank\s?you|thx|ty|cheers|appreciate\s?it)\b[\s!.,]*$/i;
const IDENTITY_PATTERN = /^(who\s?are\s?you|what\s?are\s?you|what\s?can\s?you\s?do|what\s?do\s?you\s?do|how\s?does\s?this\s?work)\??[\s!.,]*$/i;
const FAREWELL_PATTERN = /^(bye|goodbye|good\s?night|see\s?you|later)\b[\s!.,]*$/i;
import { getMoodByTag, moods as ALL_MOODS } from '../../data/moods';
import { occasions as ALL_OCCASIONS } from '../../data/occasions';

const SLOT_CATEGORIES = {
  jacket: ['Outerwear'],
  top: ['Hoodies', 'T-Shirts'],
  bottom: ['Bottoms'],
  accessory: ['Accessories'],
};

function normalize(text) {
  return (text || '').toLowerCase().trim();
}

function pick(bank, ...args) {
  const entry = bank[Math.floor(Math.random() * bank.length)];
  return typeof entry === 'function' ? entry(...args) : entry;
}

/** Finds every keyword hit for a dictionary of {bucket: [phrases]}, with a soft penalty for hits preceded by a negation word. */
function matchDictionary(text, dictionary) {
  const scores = {};
  for (const [bucket, phrases] of Object.entries(dictionary)) {
    for (const phrase of phrases) {
      const idx = text.indexOf(phrase);
      if (idx === -1) continue;
      const window = text.slice(Math.max(0, idx - 16), idx);
      const negated = /\b(not|n't|without|no)\s+(too\s+|very\s+|that\s+)?$/.test(window);
      scores[bucket] = (scores[bucket] || 0) + (negated ? -0.5 : 1);
    }
  }
  return scores;
}

function topBucket(scores) {
  const entries = Object.entries(scores).filter(([, v]) => v > 0);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function extractPriceCeiling(text) {
  const match = text.match(/under\s*(?:gh[s₵]?\s*)?([\d,]+)/i);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function scoreProduct(product, weights) {
  let score = 0;
  for (const tag of product.moodTags || []) score += (weights.mood[tag] || 0) * 2;
  for (const tag of product.occasionTags || []) score += weights.occasion[tag] || 0;
  if (weights.silhouette[product.silhouette]) score += weights.silhouette[product.silhouette];
  if (weights.priceCeiling && product.price > weights.priceCeiling) score -= 6;
  if (weights.preferHigherPrice) score += product.price / 2000;
  else if (weights.preferLowerPrice) score -= product.price / 2000;
  return score;
}

function rankProducts(products, weights, { exclude = [] } = {}) {
  const excludeIds = new Set(exclude.map((p) => p?.id).filter(Boolean));
  return products
    .filter((p) => !excludeIds.has(p.id))
    .map((product) => ({ product, score: scoreProduct(product, weights) }))
    .sort((a, b) => b.score - a.score);
}

/** Best single product per outfit slot under the given weights. `top` picks whichever of Hoodies/T-Shirts scores higher. */
function assembleOutfit(products, weights, { excludeCategory, lockedSlots = {} } = {}) {
  const outfit = {};
  for (const [slot, categories] of Object.entries(SLOT_CATEGORIES)) {
    if (lockedSlots[slot]) {
      outfit[slot] = lockedSlots[slot];
      continue;
    }
    const options = products.filter(
      (p) => categories.includes(p.category) && p.category !== excludeCategory
    );
    const ranked = rankProducts(options, weights);
    if (ranked.length) outfit[slot] = ranked[0].product;
  }
  return outfit;
}

function outfitTotal(outfit) {
  return Object.values(outfit).reduce((sum, p) => sum + (p?.price || 0), 0);
}

function weightsFromMoods(moodScores, { occasionScores = {}, silhouetteScores = {}, priceCeiling, preferHigherPrice, preferLowerPrice } = {}) {
  return {
    mood: moodScores,
    occasion: occasionScores,
    silhouette: silhouetteScores,
    priceCeiling: priceCeiling || null,
    preferHigherPrice: Boolean(preferHigherPrice),
    preferLowerPrice: Boolean(preferLowerPrice),
  };
}

function dominantMoodLabel(moodScores) {
  const tag = topBucket(moodScores);
  return tag ? getMoodByTag(tag)?.label || tag : null;
}

function findMentionedProducts(text, products) {
  const words = text.split(/\s+/).filter((w) => w.length > 3);
  return products.filter((p) => {
    const nameWords = p.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && w !== 'zévon');
    return nameWords.some((w) => words.includes(w) || text.includes(w));
  });
}

function findReferencedOwnedItem(text, products) {
  let category = null;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      category = cat;
      break;
    }
  }
  if (!category) return null;
  const color = COLOR_KEYWORDS.find((c) => text.includes(c));
  const candidates = products.filter((p) => p.category === category);
  if (!candidates.length) return null;
  if (color) {
    const colorMatch = candidates.find((p) => p.colors.some((c) => c.toLowerCase() === color));
    if (colorMatch) return colorMatch;
  }
  return candidates[0];
}

export function createConversationState() {
  return {
    lastMoodScores: {},
    lastOccasionScores: {},
    lastOutfit: null,
    lastShownProducts: [],
    priceCeiling: null,
    outfitBuilder: null, // { step: 'occasion' | 'mood', occasionTag }
  };
}

export function getQuickPrompts() {
  return [
    'I need something dark for a night out.',
    'Give me a clean minimalist outfit.',
    'I want something oversized but not too baggy.',
    'Build me a fit for a party.',
    'Something that feels expensive and subtle.',
  ];
}

function respondToOutfitBuilderStep(message, state, products) {
  const text = normalize(message);

  if (state.outfitBuilder.step === 'occasion') {
    const occasionScores = matchDictionary(text, OCCASION_KEYWORDS);
    const occasionTag = topBucket(occasionScores) || text.replace(/\s+/g, '-');
    return {
      replyText: 'And what’s the mood?',
      blocks: [{ type: 'quick-replies', kind: 'mood', options: ALL_MOODS }],
      state: { ...state, outfitBuilder: { step: 'mood', occasionTag } },
    };
  }

  const moodScores = matchDictionary(text, MOOD_KEYWORDS);
  const moodTag = topBucket(moodScores) || text.replace(/\s+/g, '-');
  return buildOutfitForOccasionMood({ occasionTag: state.outfitBuilder.occasionTag, moodTag, products, state });
}

/** Used by both the chat's outfit intent and the AIOutfitBuilder quick-flow. */
export function buildOutfitForOccasionMood({ occasionTag, moodTag, products, state }) {
  const moodScores = { [moodTag]: 3 };
  const occasionScores = { [occasionTag]: 3 };
  const weights = weightsFromMoods(moodScores, { occasionScores });
  const outfit = assembleOutfit(products, weights);
  const moodLabel = dominantMoodLabel(moodScores);

  return {
    replyText: pick(OUTFIT_INTROS, moodLabel),
    blocks: [{ type: 'outfit', slots: outfit, total: outfitTotal(outfit), currency: products[0]?.currency || 'GHS' }],
    state: {
      ...(state || createConversationState()),
      lastMoodScores: moodScores,
      lastOccasionScores: occasionScores,
      lastOutfit: outfit,
      outfitBuilder: null,
    },
  };
}

function buildComparisonResponse(text, state, products, styleDna) {
  let candidates = findMentionedProducts(text, products);
  if (candidates.length < 2) candidates = state.lastShownProducts.slice(0, 2);
  if (candidates.length < 2) {
    return {
      replyText: 'Tell me which two pieces you’re deciding between and I’ll compare them.',
      blocks: [],
      state,
    };
  }
  candidates = candidates.slice(0, 2);
  const [a, b] = candidates;

  const dnaMoods = styleDna?.hasSignal ? Object.fromEntries(styleDna.moodProfile.map((m) => [m.mood, m.percent])) : state.lastMoodScores;
  const weights = weightsFromMoods(dnaMoods);
  const scoreA = scoreProduct(a, weights);
  const scoreB = scoreProduct(b, weights);
  const winner = scoreA >= scoreB ? a : b;
  const loser = winner === a ? b : a;

  const versatility = (product) =>
    products.filter((p) => p.id !== product.id && p.moodTags.some((t) => product.moodTags.includes(t))).length;

  const reasons = [
    {
      label: 'Fit',
      text: styleDna?.hasSignal
        ? `${winner.silhouette === (styleDna.signature.find((s) => s.includes('SILHOUETTE')) || '').split(' ')[0]?.toLowerCase() ? 'More aligned with your usual silhouette.' : `A ${winner.silhouette} fit worth adding to the rotation.`}`
        : `${winner.silhouette.charAt(0).toUpperCase()}${winner.silhouette.slice(1)} through the body, built for ${winner.fit.replace('-', ' ')} wear.`,
    },
    {
      label: 'Color',
      text: winner.colorFamily
        ? `${winner.colorFamily.charAt(0).toUpperCase()}${winner.colorFamily.slice(1)} keeps it versatile against the rest of the collection.`
        : 'Neutral enough to layer with almost anything.',
    },
    {
      label: 'Versatility',
      text: `Shares its palette and mood with ${versatility(winner)} other piece${versatility(winner) === 1 ? '' : 's'} in the collection.`,
    },
  ];

  return {
    replyText: `Between these two, I’d choose the ${winner.name.replace('ZÉVON ', '')}.`,
    blocks: [{ type: 'comparison', items: [winner, loser], winner, reasons }],
    state: { ...state, lastShownProducts: [winner, loser] },
  };
}

function buildRefinementResponse(text, state, products) {
  const slotMatch = text.match(CHANGE_SLOT_PATTERN);
  const priceHitCheaper = PRICE_KEYWORDS.cheaper.some((kw) => text.includes(kw));
  const priceHitExpensive = PRICE_KEYWORDS.expensive.some((kw) => text.includes(kw));
  const moodHits = matchDictionary(text, MOOD_KEYWORDS);
  const boostedMoods = { ...state.lastMoodScores };
  for (const [tag, val] of Object.entries(moodHits)) boostedMoods[tag] = (boostedMoods[tag] || 0) + val * 2;

  const priceCeiling = priceHitCheaper ? (state.priceCeiling ? state.priceCeiling * 0.75 : 1500) : state.priceCeiling;
  const weights = weightsFromMoods(boostedMoods, {
    occasionScores: state.lastOccasionScores,
    priceCeiling,
    preferHigherPrice: priceHitExpensive,
    preferLowerPrice: priceHitCheaper,
  });

  if (slotMatch && state.lastOutfit) {
    const slot = SLOT_ALIASES[slotMatch[1]] || slotMatch[1];
    const categories = SLOT_CATEGORIES[slot] || [];
    const options = products.filter((p) => categories.includes(p.category));
    const ranked = rankProducts(options, weights, { exclude: [state.lastOutfit[slot]] });
    if (ranked.length) {
      const newOutfit = { ...state.lastOutfit, [slot]: ranked[0].product };
      return {
        replyText: pick(REFINEMENT_ACKS),
        blocks: [{ type: 'outfit', slots: newOutfit, total: outfitTotal(newOutfit), currency: products[0]?.currency || 'GHS' }],
        state: { ...state, lastOutfit: newOutfit, lastMoodScores: boostedMoods, priceCeiling },
      };
    }
  }

  if (state.lastOutfit) {
    const newOutfit = assembleOutfit(products, weights);
    return {
      replyText: pick(REFINEMENT_ACKS),
      blocks: [{ type: 'outfit', slots: newOutfit, total: outfitTotal(newOutfit), currency: products[0]?.currency || 'GHS' }],
      state: { ...state, lastOutfit: newOutfit, lastMoodScores: boostedMoods, priceCeiling },
    };
  }

  const ranked = rankProducts(products, weights);
  const items = ranked.slice(0, 4).map((r) => r.product);
  return {
    replyText: pick(REFINEMENT_ACKS),
    blocks: [{ type: 'products', items }],
    state: { ...state, lastMoodScores: boostedMoods, lastShownProducts: items, priceCeiling },
  };
}

function buildStretchResponse(state, products, styleDna) {
  if (!styleDna?.hasSignal) {
    const ranked = rankProducts(products, weightsFromMoods({}));
    const items = ranked.slice(0, 4).map((r) => r.product);
    return {
      replyText: "You're new here, so I don't have a read on your style yet — here's a spread across the collection to start.",
      blocks: [{ type: 'products', items }],
      state: { ...state, lastShownProducts: items },
    };
  }

  const items = (styleDna.recommendations || []).slice(0, 3);
  const blocks = [{ type: 'products', items }];
  if (styleDna.stretchPick) {
    blocks.push({ type: 'products', title: 'Worth stepping outside your usual', items: [styleDna.stretchPick.product] });
  }

  return {
    replyText: styleDna.stretchPick ? styleDna.stretchPick.reason : pick(STRETCH_INTROS),
    blocks,
    state: { ...state, lastShownProducts: [...items, styleDna.stretchPick?.product].filter(Boolean) },
  };
}

/** Main entry point — the only export the chat UI actually needs to drive a turn. */
export function processMessage({ message, products, state, styleDna }) {
  const currentState = state || createConversationState();
  const text = normalize(message);

  if (!text) {
    return { replyText: pick(GREETINGS), blocks: [], state: currentState };
  }

  if (currentState.outfitBuilder) {
    return respondToOutfitBuilderStep(message, currentState, products);
  }

  if (GREETING_PATTERN.test(text)) {
    return { replyText: pick(CASUAL_GREETING_REPLIES), blocks: [], state: currentState };
  }
  if (THANKS_PATTERN.test(text)) {
    return { replyText: pick(THANKS_REPLIES), blocks: [], state: currentState };
  }
  if (IDENTITY_PATTERN.test(text)) {
    return { replyText: pick(IDENTITY_REPLIES), blocks: [], state: currentState };
  }
  if (FAREWELL_PATTERN.test(text)) {
    return { replyText: pick(FAREWELL_REPLIES), blocks: [], state: currentState };
  }

  const isComparison = COMPARISON_TRIGGERS.some((kw) => text.includes(kw));
  if (isComparison) {
    return buildComparisonResponse(text, currentState, products, styleDna);
  }

  const isStretch = STRETCH_TRIGGERS.some((kw) => text.includes(kw));
  if (isStretch) {
    return buildStretchResponse(currentState, products, styleDna);
  }

  const isRefinement =
    (PRICE_KEYWORDS.cheaper.some((kw) => text.includes(kw)) ||
      PRICE_KEYWORDS.expensive.some((kw) => text.includes(kw)) ||
      CHANGE_SLOT_PATTERN.test(text) ||
      /^(more|darker|lighter|make it)\b/.test(text)) &&
    (currentState.lastOutfit || currentState.lastShownProducts.length > 0);
  if (isRefinement) {
    return buildRefinementResponse(text, currentState, products);
  }

  const isOutfitIntent = OUTFIT_TRIGGERS.some((kw) => text.includes(kw)) || /\boutfit\b/.test(text) || /\ba fit\b/.test(text);
  if (isOutfitIntent) {
    const moodScores = matchDictionary(text, MOOD_KEYWORDS);
    const occasionScores = matchDictionary(text, OCCASION_KEYWORDS);
    if (topBucket(moodScores) || topBucket(occasionScores)) {
      const moodTag = topBucket(moodScores) || 'confident';
      const occasionTag = topBucket(occasionScores) || 'everyday';
      return buildOutfitForOccasionMood({ occasionTag, moodTag, products, state: currentState });
    }
    return {
      replyText: "What's the occasion?",
      blocks: [{ type: 'quick-replies', kind: 'occasion', options: ALL_OCCASIONS }],
      state: { ...currentState, outfitBuilder: { step: 'occasion' } },
    };
  }

  const owned = findReferencedOwnedItem(text, products);
  if (owned && /go with|match|goes with|pair/.test(text)) {
    const moodScores = Object.fromEntries(owned.moodTags.map((t) => [t, 2]));
    const weights = weightsFromMoods(moodScores);
    const outfit = assembleOutfit(products, weights, { excludeCategory: owned.category, lockedSlots: {} });
    return {
      replyText: pick(COMPLEMENT_INTROS, owned.name.replace('ZÉVON ', '')),
      blocks: [{ type: 'outfit', slots: outfit, total: outfitTotal(outfit) + owned.price, currency: owned.currency }],
      state: { ...currentState, lastMoodScores: moodScores, lastOutfit: outfit },
    };
  }

  const moodScores = matchDictionary(text, MOOD_KEYWORDS);
  const occasionScores = matchDictionary(text, OCCASION_KEYWORDS);
  const silhouetteScores = matchDictionary(text, SILHOUETTE_KEYWORDS);
  const priceCeiling = extractPriceCeiling(text);
  const preferLowerPrice = PRICE_KEYWORDS.cheaper.some((kw) => text.includes(kw));
  const preferHigherPrice = PRICE_KEYWORDS.expensive.some((kw) => text.includes(kw));

  const weights = weightsFromMoods(moodScores, {
    occasionScores,
    silhouetteScores,
    priceCeiling,
    preferHigherPrice,
    preferLowerPrice,
  });

  const ranked = rankProducts(products, weights);
  const hasSignal = topBucket(moodScores) || topBucket(occasionScores) || topBucket(silhouetteScores) || priceCeiling;
  const items = (hasSignal ? ranked.filter((r) => r.score > 0) : ranked).slice(0, 4).map((r) => r.product);
  const finalItems = items.length ? items : ranked.slice(0, 4).map((r) => r.product);

  const moodLabel = dominantMoodLabel(moodScores);
  return {
    replyText: hasSignal && items.length ? pick(PRODUCT_INTROS, moodLabel) : pick(NO_MATCH_INTROS),
    blocks: [{ type: 'products', items: finalItems }],
    state: {
      ...currentState,
      lastMoodScores: Object.keys(moodScores).length ? moodScores : currentState.lastMoodScores,
      lastOccasionScores: Object.keys(occasionScores).length ? occasionScores : currentState.lastOccasionScores,
      lastShownProducts: finalItems,
      priceCeiling: priceCeiling || currentState.priceCeiling,
    },
  };
}

/** Lightweight product-only matcher for the navbar search bar — same scoring, no chat framing. */
export function searchProducts(query, products, limit = 5) {
  const text = normalize(query);
  if (!text) return [];
  const moodScores = matchDictionary(text, MOOD_KEYWORDS);
  const occasionScores = matchDictionary(text, OCCASION_KEYWORDS);
  const silhouetteScores = matchDictionary(text, SILHOUETTE_KEYWORDS);
  const priceCeiling = extractPriceCeiling(text);
  const weights = weightsFromMoods(moodScores, { occasionScores, silhouetteScores, priceCeiling });

  const nameMatches = products.filter((p) => p.name.toLowerCase().includes(text) || p.category.toLowerCase().includes(text));
  if (nameMatches.length) return nameMatches.slice(0, limit);

  const ranked = rankProducts(products, weights).filter((r) => r.score > 0);
  return ranked.slice(0, limit).map((r) => r.product);
}
