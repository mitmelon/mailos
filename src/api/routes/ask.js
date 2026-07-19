const config = require('../../config');
const sensitiveRateLimit = { config: { rateLimit: { max: config.security.rateLimit.sensitiveMax, timeWindow: config.security.rateLimit.timeWindowMs } } };

module.exports = async function askRoutes(app) {
  // POST /ask { question, mailboxId? }
  app.post('/ask', sensitiveRateLimit, async (req, reply) => {
    const { question, mailboxId } = req.body || {};
    if (!question || !question.trim()) return reply.status(400).send({ error: 'question is required' });
    const { qa } = req.server.orchestrator;
    const result = await qa.ask(question, { mailboxId: mailboxId || null });
    return reply.send(result);
  });
};
