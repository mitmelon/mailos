const AgentBase = require('../core/AgentBase');
const topics = require('../core/topics');
const providerManager = require('../providers/ProviderManager');
const { getRepository } = require('../repositories/RepositoryFactory');
const errorLog = require('../services/ErrorLogService');

const LABELS = ['Newsletter', 'Meeting', 'Invoice', 'Personal', 'Customer', 'Marketing', 'Spam', 'Scam'];

// Signals that an email is bulk/broadcast rather than a direct personal
// message - if the AI call fails or comes back uncertain, these decide
// whether to fall back to Newsletter (so it still feeds the knowledge/
// opportunity pipeline) instead of a dead-end Uncategorized.
const BULK_SIGNALS = [
  /unsubscribe/i,
  /view (this )?(email|newsletter) in (your )?browser/i,
  /you('re| are) receiving this (email|newsletter)/i,
  /list-unsubscribe/i,
  /manage (your )?(email )?preferences/i,
];

class ClassificationAgent extends AgentBase {
  constructor() {
    super('ClassificationAgent');
    this.repo = getRepository();
  }

  async init() {
    this.on(topics.EMAIL_SANITIZED, this.handleSanitized);
    this.log.info('ClassificationAgent online');
  }

  async handleSanitized(payload) {
    const { email } = payload;
    const provider = providerManager.get();
    const text = `Subject: ${email.subject}\nFrom: ${email.from}\n\n${(email.text || '').slice(0, 4000)}`;

    let result;
    try {
      result = await provider.classify(text, LABELS);
      if (result.label === 'Uncategorized' && this._looksLikeBulkMail(email)) {
        result = { label: 'Newsletter', confidence: 0.55, scores: result.scores, fallback: 'bulk_signal_heuristic' };
      }
    } catch (err) {
      await errorLog.record({ source: 'ClassificationAgent', mailboxId: email.mailboxId, message: `Classification call failed: ${err.message}`, context: { emailId: email.id } });
      result = this._looksLikeBulkMail(email)
        ? { label: 'Newsletter', confidence: 0.4, scores: [], fallback: 'ai_unavailable' }
        : { label: 'Uncategorized', confidence: 0, scores: [] };
    }

    await this.repo.update('emails', email.id, { status: 'classified', classification: result });
    await this.emit(topics.EMAIL_CLASSIFIED, { email, classification: result });
  }

  _looksLikeBulkMail(email) {
    const text = `${email.subject || ''}\n${email.text || ''}`;
    return BULK_SIGNALS.some((pattern) => pattern.test(text));
  }
}

module.exports = ClassificationAgent;
module.exports.LABELS = LABELS;
