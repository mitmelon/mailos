const config = require('../../config');
const sensitiveRateLimit = { config: { rateLimit: { max: config.security.rateLimit.sensitiveMax, timeWindow: config.security.rateLimit.timeWindowMs } } };

module.exports = async function ingestRoutes(app) {
  // POST /ingest { mailboxId?, from, subject, text, attachments? }
  //
  // Hands a message straight to the agent pipeline (Guardian → Classification
  // → Memory/Newsletter/Opportunity → Decision → Negotiation), the same path
  // real incoming mail takes. Useful for:
  //   - demoing/testing the pipeline without a live IMAP/Gmail connection
  //   - webhook-style connectors (future Slack/GitHub/etc.) that receive a
  //     push notification and need to hand it to the same shared pipeline
  //
  // Today this is backed by EmailConnector; as more connectors are added,
  // this becomes the shared shape every connector's webhook handler targets.
  app.post('/ingest', sensitiveRateLimit, async (req, reply) => {
    const { email } = req.server.orchestrator;
    const result = await email.ingest(req.body?.mailboxId || null, req.body || {});
    return reply.send({ ingested: result });
  });
};
