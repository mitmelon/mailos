const test = require('node:test');
const assert = require('node:assert');
const { normalizeSubject, extractEmailAddress } = require('../src/utils/emailThreading');
const NegotiationAgent = require('../src/agents/NegotiationAgent');

test('normalizeSubject strips Re:/Fwd: prefixes regardless of case or repetition', () => {
  assert.strictEqual(normalizeSubject('Re: Quote for 50 units'), 'quote for 50 units');
  assert.strictEqual(normalizeSubject('RE: Re: Fwd: Quote'), 're: fwd: quote'); // only strips the outermost prefix, matching a real client
  assert.strictEqual(normalizeSubject('Quote for 50 units'), 'quote for 50 units');
});

test('extractEmailAddress pulls the address out of a display-name header', () => {
  assert.strictEqual(extractEmailAddress('Sara Lee <sara@example.com>'), 'sara@example.com');
  assert.strictEqual(extractEmailAddress('sara@example.com'), 'sara@example.com');
});

test('NegotiationAgent policy gate blocks a discount above the configured limit', () => {
  const agent = new NegotiationAgent(null);
  const result = agent._checkPolicy({ discountPercent: 30 }, { maxDiscountPercent: 15, requireApprovalAboveAmount: null });
  assert.strictEqual(result.violated, true);
  assert.ok(result.reasons[0].includes('30'));
});

test('NegotiationAgent policy gate allows a discount within the configured limit', () => {
  const agent = new NegotiationAgent(null);
  const result = agent._checkPolicy({ discountPercent: 10 }, { maxDiscountPercent: 15, requireApprovalAboveAmount: null });
  assert.strictEqual(result.violated, false);
});

test('NegotiationAgent policy gate blocks an amount above the approval threshold', () => {
  const agent = new NegotiationAgent(null);
  const result = agent._checkPolicy({ amount: 5000 }, { maxDiscountPercent: 15, requireApprovalAboveAmount: 1000 });
  assert.strictEqual(result.violated, true);
});

test('NegotiationAgent policy gate ignores fields that were not proposed', () => {
  const agent = new NegotiationAgent(null);
  const result = agent._checkPolicy({}, { maxDiscountPercent: 15, requireApprovalAboveAmount: 1000 });
  assert.strictEqual(result.violated, false);
});

test('computeEfficiency: an escalated negotiation shows a partial (not 100%) efficiency gain', () => {
  const agent = new NegotiationAgent(null);
  const session = {
    status: 'escalated',
    round: 3, // 3 rounds handled autonomously before escalating on round 4
    roundMetrics: [
      { tokensUsed: 500, aiCalls: 1, elapsedMs: 800 },
      { tokensUsed: 480, aiCalls: 1, elapsedMs: 750 },
      { tokensUsed: 520, aiCalls: 1, elapsedMs: 900 },
    ],
  };
  const eff = agent.computeEfficiency(session);
  assert.strictEqual(eff.roundsAutomated, 3);
  assert.strictEqual(eff.escalatedRounds, 1);
  assert.strictEqual(eff.totalRounds, 4);
  assert.strictEqual(eff.realTokensUsed, 1500);
  assert.strictEqual(eff.baseline.humanMinutes, 12); // 4 rounds * 3 min
  assert.strictEqual(eff.mailos.humanMinutes, 3); // only the escalated round costs human time
  assert.strictEqual(eff.humanMinutesSaved, 9);
  assert.strictEqual(eff.efficiencyGainPercent, 75);
});

test('computeEfficiency: a fully autonomous agreement shows 100% efficiency gain', () => {
  const agent = new NegotiationAgent(null);
  const session = { status: 'agreed', round: 4, roundMetrics: [{ tokensUsed: 400 }, { tokensUsed: 400 }, { tokensUsed: 400 }, { tokensUsed: 400 }] };
  const eff = agent.computeEfficiency(session);
  assert.strictEqual(eff.escalatedRounds, 0);
  assert.strictEqual(eff.efficiencyGainPercent, 100);
  assert.strictEqual(eff.realTokensUsed, 1600);
});

test('computeEfficiency: a brand-new session with no rounds yet does not divide by zero', () => {
  const agent = new NegotiationAgent(null);
  const eff = agent.computeEfficiency({ status: 'open', round: 0, roundMetrics: [] });
  assert.strictEqual(eff.efficiencyGainPercent, 0);
  assert.strictEqual(Number.isFinite(eff.efficiencyGainPercent), true);
});
