const test = require('node:test');
const assert = require('node:assert');
const { recencyScore, retrievalScore, cosineSimilarity } = require('../src/utils/memoryScoring');

test('recencyScore is 1.0 for a memory accessed right now', () => {
  const score = recencyScore(new Date().toISOString());
  assert.ok(score > 0.99);
});

test('recencyScore decays to ~0.5 at the configured half-life', () => {
  const halfLifeHoursAgo = new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(); // default half-life = 168h
  const score = recencyScore(halfLifeHoursAgo);
  assert.ok(score > 0.45 && score < 0.55, `expected ~0.5, got ${score}`);
});

test('recencyScore never goes negative for very old memories', () => {
  const veryOld = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const score = recencyScore(veryOld);
  assert.ok(score >= 0 && score < 0.1);
});

test('retrievalScore rewards a memory that is both important and relevant even with mediocre recency', () => {
  const strong = retrievalScore({ recency: 0.5, importance: 0.9, relevance: 0.9 });
  const weak = retrievalScore({ recency: 0.9, importance: 0.1, relevance: 0.1 });
  assert.ok(strong > weak);
});

test('cosineSimilarity is 1 for identical vectors and 0 for orthogonal vectors', () => {
  assert.strictEqual(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.strictEqual(cosineSimilarity([1, 0], [0, 1]), 0);
});
