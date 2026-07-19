require('dotenv').config({ quiet: true });

function bool(v, def = false) {
  if (v === undefined || v === null || v === '') return def;
  return v === 'true' || v === '1';
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  server: {
    port: parseInt(process.env.PORT || '4000', 10),
    host: process.env.HOST || '0.0.0.0',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev_only_insecure_secret_change_me',
    encryptionKey: (process.env.ENCRYPTION_KEY || 'dev_only_insecure_key_change_me_32').padEnd(32, '0').slice(0, 32),
    // Optional bootstrap: if set AND no admin user exists yet in the database,
    // these seed the single admin account automatically on first boot — an
    // alternative to using the UI's first-run setup page.
    bootstrapAdminUsername: process.env.ADMIN_USERNAME || null,
    bootstrapAdminPassword: process.env.ADMIN_PASSWORD || null,
    // API keys: comma-separated list, e.g. "key1,key2". External/programmatic
    // clients send one as `Authorization: Bearer <key>` (or `x-api-key: <key>`).
    // The browser UI uses username/password + session cookie instead (see
    // /auth/*) — that login is always enforced regardless of this setting.
    apiKeys: (process.env.API_KEYS || '').split(',').map((k) => k.trim()).filter(Boolean),
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      timeWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      // Stricter limit for routes that send real email / spend real AI tokens.
      sensitiveMax: parseInt(process.env.RATE_LIMIT_SENSITIVE_MAX || '20', 10),
    },
  },
  ai: {
    qwen: {
      apiKey: process.env.QWEN_API_KEY || '',
      baseUrl: process.env.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
      model: process.env.QWEN_MODEL || 'qwen-plus',
      embeddingModel: process.env.QWEN_EMBEDDING_MODEL || 'text-embedding-v3',
    },
  },
  storage: {
    mongoUri: process.env.MONGODB_URI || '',
    jsonDbPath: require('path').join(__dirname, '..', '..', 'data'),
  },
  queue: {
    redisUrl: process.env.REDIS_URL || '',
  },
  decision: {
    autoReplyThreshold: parseFloat(process.env.AUTO_REPLY_CONFIDENCE_THRESHOLD || '0.85'),
    autoArchiveThreshold: parseFloat(process.env.AUTO_ARCHIVE_CONFIDENCE_THRESHOLD || '0.9'),
  },
  memory: {
    // Retrieval score = w.recency*recency + w.importance*importance + w.relevance*relevance
    // (same three-factor family as the Stanford "Generative Agents" memory-stream design).
    weights: { recency: 0.25, importance: 0.25, relevance: 0.5 },
    // Exponential recency decay half-life, in hours. Frequently-accessed memories
    // get their "clock" reset on retrieval, so actively-used facts decay slower.
    recencyHalfLifeHours: parseFloat(process.env.MEMORY_RECENCY_HALF_LIFE_HOURS || '168'), // 1 week
    consolidation: {
      similarityThreshold: 0.85,
      minClusterSize: 3,
    },
    forgetting: {
      // Below this combined score AND older than this age, a memory is archived
      // (soft-deleted: excluded from search, retained for audit) not erased outright.
      archiveScoreThreshold: 0.15,
      archiveMinAgeHours: 24 * 30, // 30 days
    },
  },
  negotiation: {
    // Hard ceiling on back-and-forth exchanges per conversation before forced
    // escalation — the safety net against infinite autoresponder loops and
    // against a negotiation quietly running forever with no resolution.
    maxRounds: parseInt(process.env.NEGOTIATION_MAX_ROUNDS || '10', 10),
    // Autonomous replies are only ever sent within these bounds. Anything
    // the AI proposes outside them is a hard stop, not a suggestion — the
    // negotiation escalates to the human instead of sending.
    maxDiscountPercent: parseFloat(process.env.NEGOTIATION_MAX_DISCOUNT_PERCENT || '15'),
    requireApprovalAboveAmount: process.env.NEGOTIATION_APPROVAL_ABOVE
      ? parseFloat(process.env.NEGOTIATION_APPROVAL_ABOVE) : null,
    minConfidenceToAutoSend: parseFloat(process.env.NEGOTIATION_MIN_CONFIDENCE || '0.7'),
    // Global fallback if a mailbox doesn't set its own webhookUrl.
    defaultWebhookUrl: process.env.NEGOTIATION_WEBHOOK_URL || null,
  },
  bool,
};
