const eventBus = require('./EventBus');
const logger = require('./Logger');

/**
 * Every agent in MailOS extends this class.
 * Agents are independent, own no reference to other agents,
 * and communicate ONLY via eventBus.publish/subscribe.
 */
class AgentBase {
  constructor(name) {
    this.name = name;
    this.log = logger.child({ agent: name });
    this._stats = {
      processed: 0,
      failed: 0,
      lastActiveAt: null,
      startedAt: new Date().toISOString(),
    };
  }

  /** Subclasses call this in init() to react to bus events. */
  on(topic, handler) {
    eventBus.subscribe(topic, async (payload, envelope) => {
      const start = Date.now();
      try {
        await handler.call(this, payload, envelope);
        this._stats.processed += 1;
      } catch (err) {
        this._stats.failed += 1;
        this.log.error({ err: err.message, topic }, `${this.name} failed handling ${topic}`);
      } finally {
        this._stats.lastActiveAt = new Date().toISOString();
        this.log.debug({ topic, ms: Date.now() - start }, `${this.name} handled ${topic}`);
      }
    });
  }

  /** Subclasses use this to emit events for other agents to react to. */
  async emit(topic, payload) {
    return eventBus.publish(topic, payload);
  }

  /** Override in subclass. Called once at engine boot. */
  async init() {
    throw new Error(`${this.name} must implement init()`);
  }

  status() {
    return { name: this.name, ...this._stats };
  }
}

module.exports = AgentBase;
