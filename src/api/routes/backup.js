const { getRepository } = require('../../repositories/RepositoryFactory');

module.exports = async function backupRoutes(app) {
  const repo = getRepository();

  // GET /mailboxes/:id/backup — everything tied to one mailbox: emails,
  // memories, negotiations, newsletter knowledge, opportunities, and the
  // mailbox's own profile/config. Credentials are never included — restoring
  // a mailbox after import requires re-entering credentials, a deliberate
  // safety default rather than letting encrypted secrets travel in a backup file.
  app.get('/mailboxes/:id/backup', async (req, reply) => {
    const mailbox = await repo.findById('mailboxes', req.params.id);
    if (!mailbox) return reply.status(404).send({ error: 'mailbox not found' });

    const backup = await buildBackup(repo, (mailboxId) => mailboxId === mailbox.id, [sanitizeMailbox(mailbox)]);
    return sendAsDownload(reply, backup, `mailos-backup-${mailbox.label || mailbox.id}-${dateStamp()}.json`);
  });

  // GET /backup — everything across every connected mailbox, for a full
  // instance-wide export/migration.
  app.get('/backup', async (req, reply) => {
    const mailboxes = await repo.all('mailboxes');
    const backup = await buildBackup(repo, () => true, mailboxes.map(sanitizeMailbox));
    return sendAsDownload(reply, backup, `mailos-backup-full-${dateStamp()}.json`);
  });
};

async function buildBackup(repo, mailboxFilter, mailboxes) {
  const [emails, memories, negotiations, insights, opportunities] = await Promise.all([
    repo.find('emails', (e) => mailboxFilter(e.mailboxId)),
    repo.find('memories', (m) => mailboxFilter(m.mailboxId) || !m.mailboxId), // include unscoped/global memories in a full backup
    repo.find('negotiations', (n) => mailboxFilter(n.mailboxId)),
    repo.find('insights', (i) => mailboxFilter(i.mailboxId) || !i.mailboxId),
    repo.find('opportunities', (o) => mailboxFilter(o.mailboxId) || !o.mailboxId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    source: 'MailOS',
    mailboxes,
    emails,
    memories: memories.map(({ embedding, ...rest }) => rest), // raw vectors add size without value in a human-facing backup
    negotiations,
    knowledge: insights.map(({ embedding, ...rest }) => rest),
    opportunities,
    counts: { mailboxes: mailboxes.length, emails: emails.length, memories: memories.length, negotiations: negotiations.length, knowledge: insights.length, opportunities: opportunities.length },
  };
}

function sanitizeMailbox(mailbox) {
  const { credentials, ...safe } = mailbox;
  return safe;
}

function sendAsDownload(reply, data, filename) {
  reply.header('Content-Disposition', `attachment; filename="${filename}"`);
  reply.header('Content-Type', 'application/json');
  return reply.send(data);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}
