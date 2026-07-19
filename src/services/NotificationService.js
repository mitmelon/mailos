const axios = require('axios');
const logger = require('../core/Logger');
const config = require('../config');

/**
 * Fires a plain JSON POST to whatever webhook URL is configured — a mailbox's
 * own `webhookUrl`, or the global NEGOTIATION_WEBHOOK_URL fallback. Deliberately
 * not Telegram/Slack/Discord-specific: any of those (and anything else) can
 * consume a plain JSON POST via their own incoming-webhook feature, so one
 * generic notifier covers all of them without per-provider code.
 *
 * Fire-and-forget with a short timeout and logged failure — a broken webhook
 * must never be allowed to block or crash the pipeline that's escalating to it.
 */
class NotificationService {
  async notify(webhookUrl, payload) {
    const url = webhookUrl || config.negotiation.defaultWebhookUrl;
    if (!url) {
      logger.warn({ payload }, '[NotificationService] escalation occurred but no webhookUrl is configured — set one on the mailbox or NEGOTIATION_WEBHOOK_URL');
      return { delivered: false, reason: 'no_webhook_configured' };
    }
    try {
      await axios.post(url, { source: 'MailOS', timestamp: new Date().toISOString(), ...payload }, { timeout: 8000 });
      return { delivered: true };
    } catch (err) {
      logger.error({ err: err.message, url }, '[NotificationService] webhook delivery failed');
      return { delivered: false, reason: err.message };
    }
  }
}

module.exports = new NotificationService();
