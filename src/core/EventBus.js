const { EventEmitter } = require('events');
const config = require('../config');
const logger = require('./Logger');

/**
 * EventBus is the ONLY way agents communicate.
 * No agent ever calls another agent directly — everything goes
 * through publish()/subscribe() so agents stay fully decoupled
 * and new agents can be added without touching existing ones.
 *
 * Two backends, identical interface:
 *  - BullMQ + Redis  -> when REDIS_URL is set (production / scale)
 *  - In-process queue -> zero-setup fallback (hackathon / demo mode)
 */
class EventBus {
  constructor() {
    this.mode = config.queue.redisUrl ? 'bullmq' : 'memory';
    this._emitter = new EventEmitter();
    this._emitter.setMaxListeners(100);
    this._queues = new Map();
    this._workers = new Map();
    this._deadLetter = [];

    if (this.mode === 'bullmq') {
      const { Queue, Worker, QueueEvents } = require('bullmq');
      const IORedis = require('ioredis');
      this._connection = new IORedis(config.queue.redisUrl, { maxRetriesPerRequest: null });
      this._Queue = Queue;
      this._Worker = Worker;
      this._QueueEvents = QueueEvents;
    }

    logger.info(`[EventBus] running in "${this.mode}" mode`);
  }

  _getQueue(topic) {
    if (!this._queues.has(topic)) {
      const q = new this._Queue(topic, { connection: this._connection });
      this._queues.set(topic, q);
    }
    return this._queues.get(topic);
  }

  /** Publish an event onto a topic. Fire-and-forget, at-least-once delivery. */
  async publish(topic, payload = {}) {
    const envelope = { topic, payload, publishedAt: new Date().toISOString() };
    if (this.mode === 'bullmq') {
      const queue = this._getQueue(topic);
      await queue.add(topic, envelope, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 1000,
        removeOnFail: 1000,
      });
    } else {
      // In-memory: emit on next tick so publishers never block on subscribers
      setImmediate(() => this._emitter.emit(topic, envelope));
    }
    return envelope;
  }

  /** Subscribe a handler to a topic. Handler receives (payload, envelope). */
  subscribe(topic, handler, { concurrency = 5 } = {}) {
    if (this.mode === 'bullmq') {
      const worker = new this._Worker(
        topic,
        async (job) => {
          try {
            await handler(job.data.payload, job.data);
          } catch (err) {
            logger.error({ err, topic }, '[EventBus] handler failed, will retry/dead-letter');
            throw err;
          }
        },
        { connection: this._connection, concurrency }
      );
      worker.on('failed', (job, err) => {
        if (job && job.attemptsMade >= job.opts.attempts) {
          this._deadLetter.push({ topic, data: job.data, error: err.message });
          logger.error({ topic, id: job.id }, '[EventBus] moved to dead-letter queue');
        }
      });
      this._workers.set(`${topic}:${handler.name || 'anon'}`, worker);
    } else {
      this._emitter.on(topic, async (envelope) => {
        try {
          await handler(envelope.payload, envelope);
        } catch (err) {
          logger.error({ err, topic }, '[EventBus] handler failed');
          this._deadLetter.push({ topic, data: envelope, error: err.message });
        }
      });
    }
  }

  getDeadLetterQueue() {
    return this._deadLetter;
  }

  async shutdown() {
    if (this.mode === 'bullmq') {
      for (const w of this._workers.values()) await w.close();
      for (const q of this._queues.values()) await q.close();
      await this._connection.quit();
    }
  }
}

module.exports = new EventBus();
