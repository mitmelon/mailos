const config = require('../config');
const { cosineSimilarity } = require('./vector');

/**
 * Exponential recency decay: a memory accessed `hoursAgo` ago scores 1.0
 * at hoursAgo=0 and decays to 0.5 at the configured half-life. Retrieval
 * (search hits) resets this clock — memories in active use decay slower,
 * mirroring how human recall strengthens with reuse (spaced-repetition-style
 * reinforcement) rather than a flat forget-after-N-days rule.
 */
function recencyScore(lastAccessedAt, now = Date.now()) {
  const hoursAgo = Math.max(0, (now - new Date(lastAccessedAt).getTime()) / (1000 * 60 * 60));
  const halfLife = config.memory.recencyHalfLifeHours;
  return Math.pow(0.5, hoursAgo / halfLife);
}

/** Combines recency, importance, and semantic relevance into one retrieval score, each normalized to [0,1]. */
function retrievalScore({ recency, importance, relevance }) {
  const w = config.memory.weights;
  return w.recency * recency + w.importance * importance + w.relevance * relevance;
}

module.exports = { recencyScore, retrievalScore, cosineSimilarity };
