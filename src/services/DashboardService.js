const { getRepository } = require('../repositories/RepositoryFactory');

const WORDS_PER_MINUTE = 200;
const CONTEXT_SWITCH_SECONDS = 90;

class DashboardService {
  constructor() {
    this.repo = getRepository();
  }

  async metrics({ mailboxId = null, since = null } = {}) {
    const sinceTime = since ? new Date(since).getTime() : 0;
    const emails = await this.repo.find('emails', (e) =>
      (!mailboxId || e.mailboxId === mailboxId) && new Date(e.createdAt).getTime() >= sinceTime
    );
    const opportunities = await this.repo.find('opportunities', (o) => !mailboxId || o.mailboxId === mailboxId || !o.mailboxId);
    const insights = await this.repo.find('insights', (i) => !mailboxId || i.mailboxId === mailboxId || !i.mailboxId);

    const blocked = emails.filter((e) => e.status === 'blocked');
    const requiresHuman = emails.filter((e) => e.decision?.action === 'requires_human' || e.decision?.action === 'notify');
    const autoHandled = emails.filter((e) => e.decision && ['archive', 'ignore', 'reply_draft'].includes(e.decision.action));

    const attention = this._estimateAttentionSaved(autoHandled, blocked);

    let sentCount = 0;
    if (mailboxId) {
      const mailbox = await this.repo.findById('mailboxes', mailboxId);
      sentCount = mailbox?.sentCount || 0;
    } else {
      const mailboxes = await this.repo.all('mailboxes');
      sentCount = mailboxes.reduce((sum, m) => sum + (m.sentCount || 0), 0);
    }

    return {
      emailsProcessed: emails.length,
      emailsSent: sentCount,
      threatsBlocked: blocked.length,
      handledAutomatically: autoHandled.length,
      requiresAttention: requiresHuman.length,
      knowledgeLearned: insights.length,
      opportunitiesDiscovered: opportunities.length,
      estimatedAttentionSaved: attention,
    };
  }

  /** Per-mailbox breakdown, not just an aggregate - one row per connected mailbox. */
  async perMailbox() {
    const mailboxes = await this.repo.all('mailboxes');
    return Promise.all(mailboxes.map(async (m) => ({
      mailboxId: m.id,
      label: m.label || m.emailAddress,
      status: m.status,
      metrics: await this.metrics({ mailboxId: m.id }),
    })));
  }

  async dailyReport(mailboxId = null) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const m = await this.metrics({ mailboxId, since });

    const recentInsights = await this.repo.find('insights', (i) =>
      (!mailboxId || i.mailboxId === mailboxId) && new Date(i.createdAt).getTime() >= new Date(since).getTime()
    );
    const knowledgeHighlights = recentInsights.flatMap((i) => [...(i.ideas || []), ...(i.trends || [])]).slice(0, 5);

    const recentOpportunities = (await this.repo.find('opportunities', (o) => !mailboxId || o.mailboxId === mailboxId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((o) => o.text);

    return {
      period: 'last 24 hours',
      emailsProcessed: m.emailsProcessed,
      emailsSent: m.emailsSent,
      neededAttention: m.requiresAttention,
      handledAutomatically: m.handledAutomatically,
      threatsBlocked: m.threatsBlocked,
      knowledgeLearned: knowledgeHighlights,
      opportunities: recentOpportunities,
      estimatedAttentionSaved: m.estimatedAttentionSaved,
    };
  }

  _estimateAttentionSaved(autoHandled, blocked) {
    const avgWordsPerEmail = 150;
    const readingSeconds = autoHandled.length * (avgWordsPerEmail / WORDS_PER_MINUTE) * 60;
    const contextSwitchSeconds = (autoHandled.length + blocked.length) * CONTEXT_SWITCH_SECONDS;
    const totalSeconds = Math.round(readingSeconds + contextSwitchSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    return { hours, minutes, totalSeconds, humanReadable: `${hours}h ${minutes}m` };
  }
}

module.exports = new DashboardService();
