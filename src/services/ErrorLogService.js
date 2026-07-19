const { getRepository } = require('../repositories/RepositoryFactory');
const logger = require('../core/Logger');

class ErrorLogService {
  constructor() {
    this.repo = getRepository();
  }

  async record({ source, message, mailboxId = null, context = {} }) {
    logger.error({ source, mailboxId, ...context }, message);
    try {
      await this.repo.create('errorLogs', { source, message, mailboxId, context });
    } catch {
      // storing the audit record failed - already logged via pino above, don't throw from an error handler
    }
  }

  async recent(limit = 50) {
    return this.repo.find('errorLogs', () => true, {
      sort: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      limit,
    });
  }
}

module.exports = new ErrorLogService();
