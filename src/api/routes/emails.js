const { getRepository } = require('../../repositories/RepositoryFactory');
const topics = require('../../core/topics');

module.exports = async function emailRoutes(app) {
  const repo = getRepository();

  // GET /emails?mailboxId=&label=&action=&status=&limit=
  app.get('/emails', async (req) => {
    const { mailboxId, label, action, status, limit } = req.query || {};
    const emails = await repo.find('emails', (e) => {
      if (mailboxId && e.mailboxId !== mailboxId) return false;
      if (label && e.classification?.label !== label) return false;
      if (action && e.decision?.action !== action) return false;
      if (status && e.status !== status) return false;
      return true;
    }, {
      sort: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return { count: emails.length, emails };
  });

  app.get('/emails/:id', async (req, reply) => {
    const email = await repo.findById('emails', req.params.id);
    if (!email) return reply.status(404).send({ error: 'email not found' });
    return { email };
  });

  // POST /emails/:id/send-draft { body? } - approves and sends the drafted
  // reply (or an edited version supplied in the request), for an email
  // flagged requires_human. Marks the email resolved either way.
  app.post('/emails/:id/send-draft', async (req, reply) => {
    const email = await repo.findById('emails', req.params.id);
    if (!email) return reply.status(404).send({ error: 'email not found' });
    const body = req.body?.body || email.draftReply;
    if (!body) return reply.status(400).send({ error: 'no draft available for this email and none was provided' });

    const { orchestrator } = req.server;
    await orchestrator.email.emit(topics.EMAIL_SEND_REQUESTED, {
      mailboxId: email.mailboxId,
      to: email.from,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body,
      inReplyTo: email.messageId,
      references: [...(email.references || []), email.messageId].filter(Boolean),
    });
    const updated = await repo.update('emails', email.id, { decision: { ...email.decision, action: 'reply_draft', reason: 'Reply approved and sent by owner.' }, resolvedByOwner: true });
    return reply.send({ email: updated });
  });

  // POST /emails/:id/dismiss - mark a flagged email as handled without sending anything.
  app.post('/emails/:id/dismiss', async (req, reply) => {
    const email = await repo.findById('emails', req.params.id);
    if (!email) return reply.status(404).send({ error: 'email not found' });
    const updated = await repo.update('emails', email.id, { decision: { ...email.decision, action: 'archive', reason: 'Dismissed by owner.' }, resolvedByOwner: true });
    return reply.send({ email: updated });
  });
};
