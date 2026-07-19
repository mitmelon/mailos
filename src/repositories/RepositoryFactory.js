const config = require('../config');
const logger = require('../core/Logger');

let instance = null;

function getRepository() {
  if (instance) return instance;
  if (config.storage.mongoUri) {
    const MongoRepository = require('./MongoRepository');
    instance = new MongoRepository();
    logger.info('[RepositoryFactory] using MongoRepository (MONGODB_URI is set)');
  } else {
    const NeDbRepository = require('./NeDbRepository');
    instance = new NeDbRepository();
    logger.info('[RepositoryFactory] using NeDbRepository — embedded NoSQL, zero-setup, no server process (set MONGODB_URI to switch to MongoDB instead)');
  }
  return instance;
}

module.exports = { getRepository };
