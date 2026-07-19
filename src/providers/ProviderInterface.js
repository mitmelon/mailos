class ProviderInterface {
  async generate(_messages, _opts = {}) { throw new Error('generate() not implemented'); }
  async embed(_text) { throw new Error('embed() not implemented'); }
  async classify(_text, _labels) { throw new Error('classify() not implemented'); }
  async summarize(_text, _opts = {}) { throw new Error('summarize() not implemented'); }
  async vision(_imageBase64, _prompt) { throw new Error('vision() not implemented'); }
  getUsage() { return { promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 }; }
  resetUsage() {}
}

module.exports = ProviderInterface;
