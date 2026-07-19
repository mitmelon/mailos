const Datastore = require('@seald-io/nedb');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const RepositoryInterface = require('./RepositoryInterface');
const config = require('../config');
const logger = require('../core/Logger');

/**
 * Embedded NoSQL storage — the default backend. NeDB is a MongoDB-like
 * document store that runs in-process against a file per collection: no
 * server to install or run, but real indexing and a real query engine,
 * unlike a flat JSON-blob file (the old lowdb-based approach this replaces).
 *
 * This is genuinely appropriate for production at small-to-medium scale
 * (single instance, up to roughly hundreds of thousands of documents per
 * collection) — not just a demo fallback. `MongoRepository` remains available
 * (set `MONGODB_URI`) for anyone who specifically needs multi-server
 * horizontal scaling or a managed cloud database; it isn't required to run
 * MailOS in production.
 */
class NeDbRepository extends RepositoryInterface {
  constructor() {
    super();
    this._dbDir = config.storage.jsonDbPath;
    fs.mkdirSync(this._dbDir, { recursive: true });
    this._stores = new Map();
    logger.info(`[NeDbRepository] embedded NoSQL storage at ${this._dbDir} (no server process required)`);
  }

  _store(collection) {
    if (!this._stores.has(collection)) {
      const db = new Datastore({ filename: path.join(this._dbDir, `${collection}.db`), autoload: true });
      db.ensureIndex({ fieldName: 'id', unique: true });
      this._stores.set(collection, db);
    }
    return this._stores.get(collection);
  }

  async create(collection, doc) {
    const record = { id: doc.id || uuid(), createdAt: new Date().toISOString(), ...doc };
    return new Promise((resolve, reject) => {
      this._store(collection).insert(record, (err, inserted) => (err ? reject(err) : resolve(inserted)));
    });
  }

  /**
   * `predicate` may be a plain NeDB/Mongo-style query object (fast, indexed
   * where applicable) or a JS function (fetches all docs, filters in memory)
   * — kept for parity with how the rest of the codebase already calls
   * repo.find() with function predicates.
   */
  async find(collection, predicate = () => true, { limit, sort } = {}) {
    const db = this._store(collection);
    if (typeof predicate === 'function') {
      const all = await this._all(db);
      let results = all.filter(predicate);
      if (sort) results = results.sort(sort);
      if (limit) results = results.slice(0, limit);
      return results;
    }
    return new Promise((resolve, reject) => {
      let cursor = db.find(predicate);
      if (limit) cursor = cursor.limit(limit);
      cursor.exec((err, docs) => {
        if (err) return reject(err);
        resolve(sort ? docs.sort(sort) : docs);
      });
    });
  }

  async findOne(collection, predicate) {
    if (typeof predicate === 'function') {
      const all = await this._all(this._store(collection));
      return all.find(predicate) || null;
    }
    return new Promise((resolve, reject) => {
      this._store(collection).findOne(predicate, (err, doc) => (err ? reject(err) : resolve(doc || null)));
    });
  }

  async findById(collection, id) {
    return this.findOne(collection, { id });
  }

  async update(collection, id, patch) {
    const updated = { ...patch, updatedAt: new Date().toISOString() };
    await new Promise((resolve, reject) => {
      this._store(collection).update({ id }, { $set: updated }, {}, (err) => (err ? reject(err) : resolve()));
    });
    return this.findById(collection, id);
  }

  async delete(collection, id) {
    await new Promise((resolve, reject) => {
      this._store(collection).remove({ id }, {}, (err) => (err ? reject(err) : resolve()));
    });
    return true;
  }

  async all(collection) {
    return this._all(this._store(collection));
  }

  _all(db) {
    return new Promise((resolve, reject) => {
      db.find({}, (err, docs) => (err ? reject(err) : resolve(docs)));
    });
  }
}

module.exports = NeDbRepository;
