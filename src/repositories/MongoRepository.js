const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');
const RepositoryInterface = require('./RepositoryInterface');
const config = require('../config');
const logger = require('../core/Logger');
const { withBackoff } = require('../utils/retry');

// A single flexible schema is used per collection since MailOS's
// document shapes vary by agent (memories, emails, opportunities, etc).
// Indexed fields (id, createdAt) are declared explicitly; everything
// else lives in the Mixed `data` bucket for schema flexibility while
// keeping fast lookups on the fields that matter.
const genericSchema = new mongoose.Schema(
  { id: { type: String, index: true, unique: true } },
  { strict: false, timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

class MongoRepository extends RepositoryInterface {
  constructor() {
    super();
    this._models = new Map();
    // Mailbox credentials are already AES-256-GCM encrypted before they ever
    // reach this class (src/utils/security.js, applied in EmailConnector) —
    // this repository just persists whatever ciphertext it's given. Nothing
    // here ever sees or stores a plaintext credential.
    this._ready = this._connectWithRetry();
  }

  /** Connects with exponential backoff, retrying indefinitely — a transient DB outage should never mean silently losing the ability to persist mailboxes/emails/memories. */
  async _connectWithRetry() {
    await withBackoff(() => mongoose.connect(config.storage.mongoUri), {
      maxRetries: Infinity,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      label: 'MongoDB connection',
    });
    logger.info('[MongoRepository] connected to MongoDB');

    mongoose.connection.on('disconnected', () => {
      logger.warn('[MongoRepository] disconnected from MongoDB — attempting to reconnect');
      // Any operation awaiting `_ready` after this point will wait on a fresh
      // connection attempt rather than resolving against a dead connection.
      this._ready = this._connectWithRetry();
    });
    mongoose.connection.on('reconnected', () => logger.info('[MongoRepository] reconnected to MongoDB'));
    mongoose.connection.on('error', (err) => logger.error({ err: err.message }, '[MongoRepository] connection error'));
  }

  _model(collection) {
    if (!this._models.has(collection)) {
      this._models.set(collection, mongoose.model(collection, genericSchema, collection));
    }
    return this._models.get(collection);
  }

  async _awaitReady() { await this._ready; }

  async create(collection, doc) {
    await this._awaitReady();
    const record = { id: doc.id || uuid(), ...doc };
    const Model = this._model(collection);
    const created = await Model.create(record);
    return created.toObject();
  }

  async find(collection, predicate = () => true, { limit, sort } = {}) {
    await this._awaitReady();
    const Model = this._model(collection);
    // Mongo predicates use native query filters; for parity with the
    // JSON backend's function predicates, we fetch and filter in-memory
    // when a function is passed, else pass through as a Mongo query.
    if (typeof predicate === 'function') {
      const all = await Model.find({}).lean();
      let results = all.filter(predicate);
      if (sort) results = results.sort(sort);
      if (limit) results = results.slice(0, limit);
      return results;
    }
    let query = Model.find(predicate);
    if (limit) query = query.limit(limit);
    return query.lean();
  }

  async findOne(collection, predicate) {
    await this._awaitReady();
    const Model = this._model(collection);
    if (typeof predicate === 'function') {
      const all = await Model.find({}).lean();
      return all.find(predicate) || null;
    }
    return Model.findOne(predicate).lean();
  }

  async findById(collection, id) {
    return this.findOne(collection, { id });
  }

  async update(collection, id, patch) {
    await this._awaitReady();
    const Model = this._model(collection);
    await Model.updateOne({ id }, { $set: patch });
    return this.findById(collection, id);
  }

  async delete(collection, id) {
    await this._awaitReady();
    const Model = this._model(collection);
    await Model.deleteOne({ id });
    return true;
  }

  async all(collection) {
    await this._awaitReady();
    return this._model(collection).find({}).lean();
  }
}

module.exports = MongoRepository;
