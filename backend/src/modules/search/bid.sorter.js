// ===== Sorting algorithms mta3 el bids =====

const num = (v) => Number(v);

// Tartib 7asb "best value": score sghir = a7sen (prix w délai, kol wa7ed normalisé bin 0 w 1)
function bestValueScores(bids) {
  const prices = bids.map((b) => num(b.price));
  const days = bids.map((b) => num(b.deliveryDays));
  const [minP, maxP] = [Math.min(...prices), Math.max(...prices)];
  const [minD, maxD] = [Math.min(...days), Math.max(...days)];
  const norm = (v, min, max) => (max === min ? 0 : (v - min) / (max - min));

  const scores = new Map();
  bids.forEach((b) => {
    const score = 0.6 * norm(num(b.price), minP, maxP) + 0.4 * norm(num(b.deliveryDays), minD, maxD);
    scores.set(b.id, score);
  });
  return scores;
}

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const COMPARATORS = {
  lowest_price: (a, b) => num(a.price) - num(b.price) || num(a.deliveryDays) - num(b.deliveryDays) || byNewest(a, b),
  highest_price: (a, b) => num(b.price) - num(a.price) || num(a.deliveryDays) - num(b.deliveryDays) || byNewest(a, b),
  fastest: (a, b) => num(a.deliveryDays) - num(b.deliveryDays) || num(a.price) - num(b.price) || byNewest(a, b),
  newest: byNewest,
};

const SORTS = [...Object.keys(COMPARATORS), 'best_value'];

function sortBids(bids, sort = 'best_value') {
  const list = [...bids]; // ma nbaddlouch el array el asli

  if (sort === 'best_value') {
    const scores = bestValueScores(list);
    list.forEach((b) => (b.score = Number(scores.get(b.id).toFixed(3))));
    return list.sort((a, b) => a.score - b.score || byNewest(a, b));
  }

  return list.sort(COMPARATORS[sort] || COMPARATORS.newest);
}

module.exports = { sortBids, SORTS };