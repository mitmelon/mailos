const AgentBase = require('../core/AgentBase');
const topics = require('../core/topics');
const config = require('../config');
const { getRepository } = require('../repositories/RepositoryFactory');
const settingsService = require('../services/SettingsService');

// Deterministic policy table: label -> default action + base confidence + reason.
// Rule-based on purpose: decisions must be fast, cheap, and auditable — the
// LLM already did the hard reasoning work during classification.
// Actions are exactly the five the product defines: archive, notify, reply_draft, ignore, requires_human.
const POLICY = {
  Spam: { action: 'ignore', confidence: 0.97, reason: 'Identified as spam; no user attention needed.' },
  Scam: { action: 'notify', confidence: 0.98, reason: 'Identified as a scam attempt; user should be warned.' },
  Marketing: { action: 'archive', confidence: 0.88, reason: 'Promotional content with no required action.' },
  Newsletter: { action: 'archive', confidence: 0.9, reason: 'Newsletter content is routed to the Newsletter Intelligence Agent and archived.' },
  Invoice: { action: 'notify', confidence: 0.8, reason: 'Financial document likely requires the user\'s review.' },
  Meeting: { action: 'reply_draft', confidence: 0.72, reason: 'Scheduling emails are good candidates for an assisted reply.' },
  Customer: { action: 'reply_draft', confidence: 0.7, reason: 'Customer message may be answerable with a drafted reply.' },
  Personal: { action: 'notify', confidence: 0.6, reason: 'Personal correspondence should reach the user directly.' },
  Uncategorized: { action: 'requires_human', confidence: 0, reason: 'Classifier could not confidently label this email.' },
};

class DecisionAgent extends AgentBase {
  constructor() {
    super('DecisionAgent');
    this.repo = getRepository();
  }

  async init() {
    this.on(topics.EMAIL_CLASSIFIED, this.handleClassified);
    this.log.info('DecisionAgent online');
  }

  async handleClassified(payload) {
    const { email, classification } = payload;
    const policy = POLICY[classification.label] || POLICY.Uncategorized;

    // Blend the classifier's own confidence with the policy's historical confidence —
    // a label with a strong rule but a shaky classification still gets escalated.
    const combinedConfidence = Math.min(policy.confidence, classification.confidence ?? policy.confidence);

    let action = policy.action;
    let reason = policy.reason;

    // Read threshold from settings (runtime-configurable) instead of static config
    const settings = await settingsService.get();
    const autoReplyThreshold = settings.negotiationMinConfidenceToAutoSend ?? config.decision.autoReplyThreshold;

    if (combinedConfidence < autoReplyThreshold && action === 'reply_draft') {
      action = 'requires_human';
      reason = `Confidence (${combinedConfidence.toFixed(2)}) below the reply-draft threshold (${autoReplyThreshold}); drafting is unsafe without more certainty.`;
    }
    if (combinedConfidence < 0.4) {
      action = 'requires_human';
      reason = `Confidence (${combinedConfidence.toFixed(2)}) too low to trust any automated action.`;
    }

    const decision = { action, confidence: Number(combinedConfidence.toFixed(3)), reason, label: classification.label };
    await this.repo.update('emails', email.id, { decision });
    await this.emit(topics.EMAIL_DECIDED, { email, classification, decision });
  }
}

module.exports = DecisionAgent;
module.exports.POLICY = POLICY;
