const logger = require('../core/Logger');

/**
 * Retries an async operation with exponential backoff + jitter.
 * Used for anything that depends on an external connection (IMAP, MongoDB)
 * that can legitimately be down transiently — a network blip or a restart
 * on the other end should not mean "give up forever."
 *
 * @param {() => Promise<any>} fn
 * @param {object} opts
 * @param {number} opts.maxRetries - Infinity for "keep trying forever" (e.g. a DB connection)
 * @param {number} opts.baseDelayMs
 * @param {number} opts.maxDelayMs
 * @param {string} opts.label - for log messages
 */
async function withBackoff(fn, { maxRetries = 5, baseDelayMs = 1000, maxDelayMs = 30000, label = 'operation' } = {}) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > maxRetries) {
        logger.error({ err: err.message, attempt, label }, `[retry] ${label} failed permanently after ${maxRetries} retries`);
        throw err;
      }
      const jitter = Math.random() * 0.3 + 0.85; // +/-15%
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs) * jitter;
      logger.warn({ err: err.message, attempt, maxRetries, delayMs: Math.round(delay), label }, `[retry] ${label} failed, retrying`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = { withBackoff };
