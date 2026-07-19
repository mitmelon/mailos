const test = require('node:test');
const assert = require('node:assert');
const { POLICY } = require('../src/agents/DecisionAgent');

test('every policy action is one of the five defined actions', () => {
  const validActions = new Set(['archive', 'notify', 'reply_draft', 'ignore', 'requires_human']);
  for (const [label, rule] of Object.entries(POLICY)) {
    assert.ok(validActions.has(rule.action), `${label} has invalid action: ${rule.action}`);
    assert.ok(typeof rule.reason === 'string' && rule.reason.length > 0, `${label} missing a reason`);
  }
});

test('Scam always routes to a human-visible notification', () => {
  assert.strictEqual(POLICY.Scam.action, 'notify');
  assert.ok(POLICY.Scam.confidence > 0.9);
});
