const logger = require('./Logger');
const ConnectorRegistry = require('./ConnectorRegistry');
const GuardianAgent = require('../agents/GuardianAgent');
const ClassificationAgent = require('../agents/ClassificationAgent');
const MemoryAgent = require('../agents/MemoryAgent');
const NewsletterIntelligenceAgent = require('../agents/NewsletterIntelligenceAgent');
const OpportunityAgent = require('../agents/OpportunityAgent');
const DecisionAgent = require('../agents/DecisionAgent');
const NegotiationAgent = require('../agents/NegotiationAgent');
const EmailConnector = require('../connectors/EmailConnector');
const QAAgent = require('../agents/QAAgent');

/**
 * Orchestrator wires the channel-agnostic agent pipeline (Guardian →
 * Classification → Memory/Newsletter/Opportunity → Decision → Negotiation)
 * together with whichever connectors are registered. Email is the only
 * connector implemented today; the ConnectorRegistry is the seam where
 * Slack/GitHub/Calendar/CRM/WhatsApp connectors plug in later without
 * touching any of the agents below.
 */
class Orchestrator {
  constructor() {
    this.memory = new MemoryAgent();
    this.guardian = new GuardianAgent();
    this.classification = new ClassificationAgent();
    this.newsletter = new NewsletterIntelligenceAgent();
    this.opportunity = new OpportunityAgent();
    this.decision = new DecisionAgent();
    this.negotiation = new NegotiationAgent(this.memory);
    this.qa = new QAAgent(this.memory);

    this.connectors = new ConnectorRegistry();
    this.connectors.register(new EmailConnector());

    this.agents = [
      this.guardian, this.classification, this.memory, this.newsletter,
      this.opportunity, this.decision, this.negotiation, this.qa,
      ...this.connectors.list().map((type) => this.connectors.get(type)),
    ];
  }

  /** Convenience accessor used throughout the API routes. */
  get email() {
    return this.connectors.get('email');
  }

  async start() {
    logger.info('[Orchestrator] booting MailOS — pipeline: Guardian → Classification → Memory/Newsletter/Opportunity → Decision → Negotiation');
    for (const agent of this.agents) {
      await agent.init();
    }
    logger.info(`[Orchestrator] ${this.agents.length} agents/connectors online (connectors: ${this.connectors.list().join(', ')})`);
    this._startMemoryMaintenance();
  }

  /** Real background jobs, not just callable methods: consolidation and soft-forgetting run continuously while the engine is up. */
  _startMemoryMaintenance() {
    const run = async () => {
      try {
        const consolidation = await this.memory.consolidate();
        const forgetting = await this.memory.forgetExpired();
        if (consolidation.reflectionsCreated || forgetting.archivedCount || forgetting.expiredCount) {
          logger.info({ ...consolidation, ...forgetting }, '[Orchestrator] memory maintenance pass complete');
        }
      } catch (err) {
        logger.error({ err: err.message }, '[Orchestrator] memory maintenance pass failed');
      }
    };
    this._memoryMaintenanceInterval = setInterval(run, 60 * 60 * 1000); // hourly
  }

  status() {
    return this.agents.map((a) => a.status());
  }
}

module.exports = Orchestrator;
