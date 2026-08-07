import { getOrdersByUser } from './orders.js';
import { getWishlistProductIds } from './wishlist.js';
import { getRecentProductViews, getRecentMoodSelections } from './interactions.js';
import { listProducts, getProductById } from './products.js';

export const MOOD_LABELS = {
  dark: 'Dark',
  minimal: 'Minimal',
  rebellious: 'Rebellious',
  elegant: 'Elegant',
  night: 'Night',
  raw: 'Raw',
  confident: 'Confident',
  'quiet-luxury': 'Quiet Luxury',
};

// Purchases say the most about taste, a saved item says less, a glance says
// least — direct mood picks count almost as much as a wishlist save since
// they're an explicit signal, not an inferred one.
const PURCHASE_WEIGHT = 3;
const WISHLIST_WEIGHT = 2;
const VIEW_WEIGHT = 1;
const MOOD_SELECTION_WEIGHT = 2;

function addTagWeights(tally, tags, weight) {
  for (const tag of tags) {
    tally[tag] = (tally[tag] || 0) + weight;
  }
}

/**
 * Turns a customer's purchases, wishlist, recent views and mood picks into
 * a weighted style profile — never fabricated for a customer with no signal.
 */
export async function computeStyleDna(userId) {
  const allOrders = await getOrdersByUser(userId);
  const orders = allOrders.filter((o) => o.status === 'paid' || o.status === 'completed');
  const wishlistIds = await getWishlistProductIds(userId);
  const views = await getRecentProductViews(userId, 50);
  const moods = await getRecentMoodSelections(userId, 20);

  const purchasedIds = new Set();
  for (const order of orders) {
    for (const line of order.items) purchasedIds.add(line.id);
  }

  const moodTally = {};
  const silhouetteTally = {};
  const colorTally = {};
  const weightSamples = [];

  const applyProduct = async (productId, weight) => {
    const product = await getProductById(productId);
    if (!product) return;
    addTagWeights(moodTally, product.moodTags, weight);
    if (product.silhouette) silhouetteTally[product.silhouette] = (silhouetteTally[product.silhouette] || 0) + weight;
    if (product.colorFamily) colorTally[product.colorFamily] = (colorTally[product.colorFamily] || 0) + weight;
    if (product.weightGsm) weightSamples.push(product.weightGsm);
  };

  for (const id of purchasedIds) await applyProduct(id, PURCHASE_WEIGHT);
  for (const id of wishlistIds) await applyProduct(id, WISHLIST_WEIGHT);
  for (const view of views) await applyProduct(view.product_id, VIEW_WEIGHT);
  for (const m of moods) moodTally[m.mood] = (moodTally[m.mood] || 0) + MOOD_SELECTION_WEIGHT;

  const interactedProductIds = [...new Set([...purchasedIds, ...wishlistIds, ...views.map((v) => v.product_id)])];

  if (Object.keys(moodTally).length === 0) {
    return { hasSignal: false, moodProfile: [], signature: [], interactedProductIds };
  }

  const totalMoodWeight = Object.values(moodTally).reduce((a, b) => a + b, 0);
  const moodProfile = Object.entries(moodTally)
    .map(([mood, weight]) => ({
      mood,
      label: MOOD_LABELS[mood] || mood,
      percent: Math.round((weight / totalMoodWeight) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);

  // Rounding can land a point or two off 100 — hand the remainder to the
  // dominant mood rather than showing a profile that visibly doesn't add up.
  const roundedSum = moodProfile.reduce((sum, m) => sum + m.percent, 0);
  if (moodProfile.length && roundedSum !== 100) moodProfile[0].percent += 100 - roundedSum;

  const topSilhouette = Object.entries(silhouetteTally).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topColor = Object.entries(colorTally).sort((a, b) => b[1] - a[1])[0]?.[0];
  const avgWeight = weightSamples.length ? weightSamples.reduce((a, b) => a + b, 0) / weightSamples.length : null;
  const topMood = moodProfile[0]?.mood;

  const signature = [];
  if (topSilhouette) signature.push(`${topSilhouette.toUpperCase()} SILHOUETTES`);
  if (topColor) signature.push(`${topColor.toUpperCase()} PALETTE`);
  if (topMood === 'minimal' || topMood === 'quiet-luxury') signature.push('MINIMAL DETAILS');
  if (avgWeight && avgWeight >= 400) signature.push('HEAVYWEIGHT FABRICS');
  if (topMood === 'elegant' || topMood === 'quiet-luxury') signature.push('REFINED FINISHES');
  if (topMood === 'raw' || topMood === 'rebellious') signature.push('UNPOLISHED EDGES');

  return {
    hasSignal: true,
    moodProfile: moodProfile.slice(0, 5),
    signature: [...new Set(signature)].slice(0, 4),
    interactedProductIds,
  };
}

/**
 * Top matches for the profile, plus one deliberate "stretch pick" — a
 * product that shares real overlap with the customer's taste but leans
 * into a mood outside their top two, with a stated reason it still fits.
 * Never recommends something already purchased, wishlisted or recently viewed.
 */
export async function recommendForStyleDna(userId, limit = 4) {
  const dna = await computeStyleDna(userId);
  const interacted = new Set(dna.interactedProductIds);
  const allProducts = await listProducts();
  const candidates = allProducts.filter((p) => !interacted.has(p.id));

  if (!dna.hasSignal) {
    return { recommendations: candidates.slice(0, limit), stretchPick: null, dna };
  }

  const moodWeight = Object.fromEntries(dna.moodProfile.map((m) => [m.mood, m.percent]));
  const topMoods = dna.moodProfile.slice(0, 2).map((m) => m.mood);

  const scored = candidates
    .map((product) => ({
      product,
      score: product.moodTags.reduce((sum, tag) => sum + (moodWeight[tag] || 0), 0),
    }))
    .sort((a, b) => b.score - a.score);

  const inProfile = scored.filter((s) => s.score > 0);
  const recommendations = (inProfile.length ? inProfile : scored).slice(0, limit).map((s) => s.product);

  const stretchCandidate = scored.find(
    (s) =>
      s.score > 0 &&
      !recommendations.includes(s.product) &&
      s.product.moodTags.some((tag) => !topMoods.includes(tag))
  );

  let stretchPick = null;
  if (stretchCandidate) {
    const newMood = stretchCandidate.product.moodTags.find((tag) => !topMoods.includes(tag));
    const dominantMoodLabel = MOOD_LABELS[topMoods[0]] || topMoods[0];
    const newMoodLabel = MOOD_LABELS[newMood] || newMood;
    const sharesSignatureSilhouette = dna.signature.some((line) =>
      line.startsWith(String(stretchCandidate.product.silhouette).toUpperCase())
    );

    stretchPick = {
      product: stretchCandidate.product,
      reason: sharesSignatureSilhouette
        ? `You normally lean ${dominantMoodLabel.toLowerCase()}, but this keeps your usual ${stretchCandidate.product.silhouette} silhouette while introducing a ${newMoodLabel.toLowerCase()} edge.`
        : `You normally choose ${dominantMoodLabel.toLowerCase()} pieces — this ${newMoodLabel.toLowerCase()} one is a step outside that, worth a look.`,
    };
  }

  return { recommendations, stretchPick, dna };
}
