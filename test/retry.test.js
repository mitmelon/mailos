const test = require('node:test');
const assert = require('node:assert');
const { withBackoff } = require('../src/utils/retry');

test('withBackoff returns the result immediately on first success, no delay', async () => {
  let calls = 0;
  const result = await withBackoff(async () => { calls += 1; return 'ok'; }, { maxRetries: 3, baseDelayMs: 1 });
  assert.strictEqual(result, 'ok');
  assert.strictEqual(calls, 1);
});

test('withBackoff retries a failing operation and succeeds once it stops failing', async () => {
  let calls = 0;
  const result = await withBackoff(
    async () => {
      calls += 1;
      if (calls < 3) throw new Error('transient failure');
      return 'recovered';
    },
    { maxRetries: 5, baseDelayMs: 1, maxDelayMs: 5 }
  );
  assert.strictEqual(result, 'recovered');
  assert.strictEqual(calls, 3);
});

test('withBackoff gives up and throws after exhausting maxRetries', async () => {
  let calls = 0;
  await assert.rejects(
    () => withBackoff(async () => { calls += 1; throw new Error('always fails'); }, { maxRetries: 2, baseDelayMs: 1, maxDelayMs: 2 }),
    /always fails/
  );
  assert.strictEqual(calls, 3); // initial attempt + 2 retries
});
