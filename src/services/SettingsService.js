const { getRepository } = require('../repositories/RepositoryFactory');
const config = require('../config');

const SINGLETON_ID = 'settings';

/**
 * Everything here is editable live from the Settings UI (GET/PATCH /settings)
 * without restarting the process — providers and agents read through this
 * service rather than capturing config at boot time. `.env` values act only
 * as the initial default; once a value is explicitly set here, it wins.
 */
class SettingsService {
  constructor() {
    this.repo = getRepository();
    this._cache = null;
  }

  _defaults() {
    return {
      qwenApiKey: config.ai.qwen.apiKey,
      qwenBaseUrl: config.ai.qwen.baseUrl,
      qwenModel: config.ai.qwen.model,
      qwenEmbeddingModel: config.ai.qwen.embeddingModel,
      negotiationMaxRounds: config.negotiation.maxRounds,
      negotiationMaxDiscountPercent: config.negotiation.maxDiscountPercent,
      negotiationRequireApprovalAboveAmount: config.negotiation.requireApprovalAboveAmount,
      negotiationMinConfidenceToAutoSend: config.negotiation.minConfidenceToAutoSend,
    };
  }

  async get() {
    const doc = await this.repo.findOne('settings', { id: SINGLETON_ID });
    return { ...this._defaults(), ...(doc || {}) };
  }

  async update(patch) {
    const existing = await this.repo.findOne('settings', { id: SINGLETON_ID });
    if (!existing) {
      return this.repo.create('settings', { id: SINGLETON_ID, ...this._defaults(), ...patch });
    }
    return this.repo.update('settings', SINGLETON_ID, patch);
  }

  /** Returns the settings with the API key masked, for safely displaying in a UI list/log. */
  async getMasked() {
    const settings = await this.get();
    return { ...settings, qwenApiKey: maskKey(settings.qwenApiKey) };
  }
}

function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}${'•'.repeat(Math.max(key.length - 8, 4))}${key.slice(-4)}`;
}

module.exports = new SettingsService();
