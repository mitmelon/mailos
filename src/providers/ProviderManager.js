const QwenProvider = require('./QwenProvider');
const logger = require('../core/Logger');

class ProviderManager {
  constructor() {
    this._provider = new QwenProvider();
    logger.info('[ProviderManager] Qwen provider active');
  }

  get() {
    return this._provider;
  }
}

module.exports = new ProviderManager();
