const AgentBase = require('../core/AgentBase');
const providerManager = require('../providers/ProviderManager');
const { getRepository } = require('../repositories/RepositoryFactory');

class QAAgent extends AgentBase {
  constructor(memoryAgent) {
    super('QAAgent');
    this.repo = getRepository();
    this.memoryAgent = memoryAgent;
  }

  async init() {
    this.log.info('QAAgent online — ready to answer questions');
  }

  /** Answers a free-form question, grounded in memory + recent emails (including blocked/spam) + newsletter insights + opportunities. */
  async ask(question, { mailboxId = null } = {}) {
    const [memories, recentEmails, insights, opportunities] = await Promise.all([
      this.memoryAgent.search(question, { limit: 8, mailboxId }),
      this.repo.find('emails', (e) => !mailboxId || e.mailboxId === mailboxId, {
        sort: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), limit: 40,
      }),
      this.repo.find('insights', (i) => !mailboxId || i.mailboxId === mailboxId || !i.mailboxId, { sort: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), limit: 15 }),
      this.repo.find('opportunities', (o) => !mailboxId || o.mailboxId === mailboxId || !o.mailboxId),
    ]);

    const context = [
      `MEMORY:\n${memories.map((m) => `- ${m.text}`).join('\n') || '(none)'}`,
      `RECENT EMAILS (most recent first, includes blocked/spam):\n${recentEmails.map((e) =>
        `- [${e.status}${e.classification?.label ? '/' + e.classification.label : ''}] from ${e.from}, "${e.subject}" — ${(e.text || '').slice(0, 120).replace(/\s+/g, ' ')}${e.receivedAt ? ` (${e.receivedAt})` : ''}`
      ).join('\n') || '(none yet)'}`,
      `NEWSLETTER KNOWLEDGE:\n${insights.map((i) => `- ${[...(i.ideas || []), ...(i.trends || [])].join('; ')}`).filter(Boolean).join('\n') || '(none)'}`,
      `OPPORTUNITIES:\n${opportunities.map((o) => `- ${o.text} (mentioned ${o.mentions}x)`).join('\n') || '(none)'}`,
    ].join('\n\n');

    const provider = providerManager.get();
    const system = {
      role: 'system',
      content:
        'You are MailOS, an AI that has been reading and learning from the user\'s email. ' +
        'Answer the user\'s question using ONLY the context below - it includes recent emails of every kind, ' +
        'including ones blocked as spam/threats. If the context genuinely has no relevant information, say so honestly ' +
        'rather than guessing. Be concise and specific, referencing senders/subjects where relevant.\n\n' + context,
    };

    const answer = await provider.generate([system, { role: 'user', content: question }], { temperature: 0.3, maxTokens: 600 });
    return { question, answer, groundedIn: { memories: memories.length, emails: recentEmails.length, insights: insights.length, opportunities: opportunities.length } };
  }
}

module.exports = QAAgent;
