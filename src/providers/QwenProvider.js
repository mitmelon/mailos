const axios = require('axios');
const ProviderInterface = require('./ProviderInterface');
const logger = require('../core/Logger');
const settingsService = require('../services/SettingsService');

class QwenProvider extends ProviderInterface {
  constructor() {
    super();
    // Real usage counters, not an estimate — pulled from DashScope's own
    // `usage` field on every response. Used for the negotiation efficiency
    // benchmark (real tokens spent, not a guess).
    this._usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 };
  }

  /**
   * Reads current settings on every call rather than capturing them once at
   * construction — this is what makes the Settings UI (PATCH /settings)
   * take effect immediately, with no restart, mid-negotiation or otherwise.
   * The small extra DB read is negligible next to the network-bound AI call
   * it precedes.
   */
  async _client() {
    const settings = await settingsService.get();
    if (!settings.qwenApiKey) {
      logger.warn('[QwenProvider] No Qwen API key configured — set one in Settings or QWEN_API_KEY in .env');
    }
    return {
      client: axios.create({
        baseURL: settings.qwenBaseUrl,
        headers: { Authorization: `Bearer ${settings.qwenApiKey}`, 'Content-Type': 'application/json' },
        timeout: 60000,
      }),
      model: settings.qwenModel,
      embeddingModel: settings.qwenEmbeddingModel,
    };
  }

  /** Snapshot of cumulative real token usage since the provider was created or last reset. */
  getUsage() {
    return { ...this._usage };
  }

  resetUsage() {
    this._usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, calls: 0 };
  }

  _recordUsage(usage) {
    if (!usage) return;
    this._usage.promptTokens += usage.prompt_tokens || 0;
    this._usage.completionTokens += usage.completion_tokens || 0;
    this._usage.totalTokens += usage.total_tokens || 0;
    this._usage.calls += 1;
  }

  async generate(messages, opts = {}) {
    const { client, model } = await this._client();
    const payload = {
      model: opts.model || model,
      messages: Array.isArray(messages) ? messages : [{ role: 'user', content: String(messages) }],
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
    };
    const { data } = await client.post('/chat/completions', payload);
    this._recordUsage(data.usage);
    return data.choices?.[0]?.message?.content ?? '';
  }

  async embed(text) {
    const { client, embeddingModel } = await this._client();
    const { data } = await client.post('/embeddings', { model: embeddingModel, input: text });
    this._recordUsage(data.usage);
    return data.data?.[0]?.embedding ?? [];
  }

  async classify(text, labels) {
    const system = {
      role: 'system',
      content:
        'You are a precise email classifier. Respond ONLY with strict JSON: ' +
        '{"labels": [{"label": string, "confidence": number 0-1}, ...]}. ' +
        `Choose from this exact label set: ${labels.join(', ')}. ` +
        'Multiple labels are allowed. No prose, no markdown fences.',
    };
    const user = { role: 'user', content: text.slice(0, 6000) };
    const raw = await this.generate([system, user], { temperature: 0.1, maxTokens: 400 });
    return this._safeParseClassification(raw, labels);
  }

  _safeParseClassification(raw, labels) {
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const scores = parsed.labels || [];
      const top = scores.sort((a, b) => b.confidence - a.confidence)[0] || { label: 'Uncategorized', confidence: 0 };
      return { label: top.label, confidence: top.confidence, scores };
    } catch (err) {
      logger.warn({ raw }, '[QwenProvider] classification JSON parse failed, defaulting to Uncategorized');
      return { label: 'Uncategorized', confidence: 0, scores: labels.map((l) => ({ label: l, confidence: 0 })) };
    }
  }

  async summarize(text, opts = {}) {
    const system = {
      role: 'system',
      content: `Summarize the following content in ${opts.maxSentences || 3} sentences, focused on: ${opts.focus || 'key facts and action items'}. Be concise and factual.`,
    };
    return this.generate([system, { role: 'user', content: text.slice(0, 12000) }], { temperature: 0.3 });
  }

  async vision(imageBase64, prompt, opts = {}) {
    const { client } = await this._client();
    const payload = {
      model: opts.model || 'qwen-vl-plus',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Describe this image.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } },
          ],
        },
      ],
    };
    const { data } = await client.post('/chat/completions', payload);
    return data.choices?.[0]?.message?.content ?? '';
  }
}

module.exports = QwenProvider;
