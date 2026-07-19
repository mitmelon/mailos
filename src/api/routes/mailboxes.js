const { v4: uuid } = require('uuid');
const { getRepository } = require('../../repositories/RepositoryFactory');
const config = require('../../config');

const DEFAULT_PROFILE = { calendar: null, priorities: [], location: null, preferences: {}, documents: [] };
const sensitiveRateLimit = { config: { rateLimit: { max: config.security.rateLimit.sensitiveMax, timeWindow: config.security.rateLimit.timeWindowMs } } };

module.exports = async function mailboxRoutes(app) {
  const repo = getRepository();

  // POST /connect-email
  // { host, port, user, password, tls, smtpHost, smtpPort, label,
  //   webhookUrl?, negotiationPolicy?, profile? }
  // Works with any normal mailbox (Gmail, Outlook, Yahoo, self-hosted —
  // anything speaking IMAP/SMTP with a username+password or app password).
  // Monitoring (IMAP IDLE) starts immediately; no separate "start listening" step.
  // Supports connecting many mailboxes — call this once per mailbox; each is
  // isolated (own IMAP IDLE connection, own profile, own negotiation policy)
  // and every connected mailbox listens and responds independently.
  app.post('/connect-email', sensitiveRateLimit, async (req, reply) => {
    const { host, port, user, password, tls, smtpHost, smtpPort, label, webhookUrl, negotiationPolicy, profile } = req.body || {};
    if (!host || !user || !password || !smtpHost) {
      return reply.status(400).send({ error: 'host, user, password, and smtpHost are required' });
    }
    const { email } = req.server.orchestrator;
    const mailbox = await email.connectImap({
      host, port, user, password, tls, smtpHost, smtpPort, label, webhookUrl, negotiationPolicy,
      profile: { ...DEFAULT_PROFILE, ...(profile || {}) },
    });
    return reply.send({ mailbox: sanitize(mailbox) });
  });

  // POST /disconnect-email { mailboxId }
  app.post('/disconnect-email', async (req, reply) => {
    const { mailboxId } = req.body || {};
    if (!mailboxId) return reply.status(400).send({ error: 'mailboxId is required' });
    await req.server.orchestrator.email.disconnect(mailboxId);
    return reply.send({ disconnected: mailboxId });
  });

  app.get('/mailboxes', async (req) => {
    const mailboxes = await repo.all('mailboxes');
    return { mailboxes: mailboxes.map(sanitize) };
  });

  app.get('/mailboxes/:id/profile', async (req, reply) => {
    const mailbox = await repo.findById('mailboxes', req.params.id);
    if (!mailbox) return reply.status(404).send({ error: 'mailbox not found' });
    return reply.send({ profile: mailbox.profile || DEFAULT_PROFILE });
  });

  // PATCH /mailboxes/:id — update webhookUrl / negotiationPolicy / label / profile
  // without reconnecting. `profile` fields (calendar, priorities, location,
  // preferences) are shallow-merged: send only what changed.
  app.patch('/mailboxes/:id', async (req, reply) => {
    const { webhookUrl, negotiationPolicy, label, profile } = req.body || {};
    const mailbox = await repo.findById('mailboxes', req.params.id);
    if (!mailbox) return reply.status(404).send({ error: 'mailbox not found' });

    const patch = {};
    if (webhookUrl !== undefined) patch.webhookUrl = webhookUrl;
    if (negotiationPolicy !== undefined) patch.negotiationPolicy = negotiationPolicy;
    if (label !== undefined) patch.label = label;
    if (profile !== undefined) {
      patch.profile = { ...DEFAULT_PROFILE, ...(mailbox.profile || {}), ...profile };
    }
    const updated = await repo.update('mailboxes', req.params.id, patch);
    return reply.send({ mailbox: sanitize(updated) });
  });

  // POST /mailboxes/:id/documents { name, content } — attach a reference
  // document (FAQ, policy, price sheet, rules — anything textual) that the
  // agent consults when negotiating or answering questions for this mailbox.
  // Plain text/markdown content only — no file upload/binary parsing in this build.
  app.post('/mailboxes/:id/documents', async (req, reply) => {
    const { name, content } = req.body || {};
    if (!name || !content) return reply.status(400).send({ error: 'name and content are required' });
    const mailbox = await repo.findById('mailboxes', req.params.id);
    if (!mailbox) return reply.status(404).send({ error: 'mailbox not found' });

    const profile = { ...DEFAULT_PROFILE, ...(mailbox.profile || {}) };
    const document = { id: uuid(), name, content, addedAt: new Date().toISOString() };
    profile.documents = [...(profile.documents || []), document];
    const updated = await repo.update('mailboxes', req.params.id, { profile });
    return reply.send({ document, profile: updated.profile });
  });

  app.delete('/mailboxes/:id/documents/:docId', async (req, reply) => {
    const mailbox = await repo.findById('mailboxes', req.params.id);
    if (!mailbox) return reply.status(404).send({ error: 'mailbox not found' });
    const profile = { ...DEFAULT_PROFILE, ...(mailbox.profile || {}) };
    profile.documents = (profile.documents || []).filter((d) => d.id !== req.params.docId);
    const updated = await repo.update('mailboxes', req.params.id, { profile });
    return reply.send({ profile: updated.profile });
  });

  // POST /sync { mailboxId }  -- if omitted, syncs all connected mailboxes
  app.post('/sync', sensitiveRateLimit, async (req, reply) => {
    const { mailboxId } = req.body || {};
    const { email } = req.server.orchestrator;
    if (mailboxId) {
      const result = await email.syncMailbox(mailboxId);
      return reply.send({ synced: [sanitize(result)] });
    }
    const mailboxes = await repo.find('mailboxes', (m) => m.status === 'connected');
    const results = [];
    for (const m of mailboxes) results.push(sanitize(await email.syncMailbox(m.id)));
    return reply.send({ synced: results });
  });
};

function sanitize(mailbox) {
  if (!mailbox) return mailbox;
  const { credentials, ...safe } = mailbox;
  return safe;
}
