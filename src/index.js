const logger = require('./core/Logger');
const Orchestrator = require('./core/Orchestrator');
const { startServer } = require('./api/server');

class MailOS {
  constructor() {
    this.orchestrator = new Orchestrator();
    this.app = null;
  }

  async start() {
    await this.orchestrator.start();
    this.app = await startServer(this.orchestrator);
    return this;
  }

  async stop() {
    if (this.app) await this.app.close();
  }
}

// If run directly (`node src/index.js` / `npm start`), boot immediately.
if (require.main === module) {
  const engine = new MailOS();
  engine.start().catch((err) => {
    logger.error({ err: err.message, stack: err.stack }, 'MailOS failed to start');
    process.exit(1);
  });

  process.on('SIGINT', async () => { await engine.stop(); process.exit(0); });
  process.on('SIGTERM', async () => { await engine.stop(); process.exit(0); });
}

module.exports = MailOS;
