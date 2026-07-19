const { getRepository } = require('../../repositories/RepositoryFactory');
const config = require('../../config');
const sensitiveRateLimit = { config: { rateLimit: { max: config.security.rateLimit.sensitiveMax, timeWindow: config.security.rateLimit.timeWindowMs } } };

module.exports = async function negotiationRoutes(app) {
  const repo = getRepository();

  // POST /negotiations — owner-initiated: define a goal, MailOS sends the opening move.
  // { mailboxId, to, subject, intent: { type, goal, description?, constraints }, policy? }
  app.post('/negotiations', sensitiveRateLimit, async (req, reply) => {
    const { mailboxId, to, subject, intent, policy } = req.body || {};
    if (!mailboxId || !to || !subject || !intent || !intent.goal) {
      return reply.status(400).send({ error: 'mailboxId, to, subject, and intent.goal are required' });
    }
    const { negotiation } = req.server.orchestrator;
    const session = await negotiation.startFromIntent({ mailboxId, to, subject, intent, policy });
    return reply.send({ negotiation: session });
  });

  // GET /negotiations?status=&mailboxId=
  app.get('/negotiations', async (req) => {
    const { status, mailboxId } = req.query || {};
    const { negotiation } = req.server.orchestrator;
    const sessions = await repo.find('negotiations', (s) => {
      if (status && s.status !== status) return false;
      if (mailboxId && s.mailboxId !== mailboxId) return false;
      return true;
    }, { sort: (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt) });
    return { count: sessions.length, negotiations: sessions.map((s) => ({ ...s, efficiency: negotiation.computeEfficiency(s) })) };
  });

  app.get('/negotiations/:id', async (req, reply) => {
    const session = await repo.findById('negotiations', req.params.id);
    if (!session) return reply.status(404).send({ error: 'negotiation not found' });
    const { negotiation } = req.server.orchestrator;
    return { negotiation: { ...session, efficiency: negotiation.computeEfficiency(session) } };
  });

  // POST /negotiations/:id/resume — a human reviewed an escalated negotiation
  // and is letting the AI continue autonomously again.
  app.post('/negotiations/:id/resume', async (req, reply) => {
    const session = await repo.findById('negotiations', req.params.id);
    if (!session) return reply.status(404).send({ error: 'negotiation not found' });
    if (session.status !== 'escalated') return reply.status(400).send({ error: `session is "${session.status}", not escalated — nothing to resume` });
    const updated = await repo.update('negotiations', session.id, { status: 'open', escalatedReason: null });
    return reply.send({ negotiation: updated });
  });
};
