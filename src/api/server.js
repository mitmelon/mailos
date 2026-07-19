const path = require('path');
const fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const rateLimit = require('@fastify/rate-limit');
const cookie = require('@fastify/cookie');
const fstatic = require('@fastify/static');
const config = require('../config');
const logger = require('../core/Logger');
const { applyAuth } = require('./security');
const authService = require('../services/AuthService');

async function buildServer(orchestrator) {
  const app = fastify({ logger: false, bodyLimit: 2 * 1024 * 1024, trustProxy: true }); // trustProxy: real client IP behind Alibaba Cloud's load balancer, needed for login lockout fingerprinting

  // Security headers (CSP, X-Frame-Options, etc.) — standard hardening for
  // any HTTP-facing service, not just browser-rendered ones. CSP is relaxed
  // just enough to allow the Tailwind CDN script the UI uses.
  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
  });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie);

  // Global rate limit — applies to every route unless overridden per-route
  // (sensitive routes like /connect-email, /negotiations, /ingest, /ask set
  // a stricter limit directly on their route definitions).
  await app.register(rateLimit, {
    global: true,
    max: config.security.rateLimit.max,
    timeWindow: config.security.rateLimit.timeWindowMs,
  });

  // Static UI (public/) — plain HTML/CSS/JS, no build step. Contains no
  // secrets; every API call it makes still goes through the auth hook below.
  await app.register(fstatic, { root: path.join(__dirname, '..', '..', 'public') });

  // Auth — API key OR session cookie, either is sufficient. Applied directly
  // on the top-level instance (not via app.register) so plugin encapsulation
  // can't scope it away from any route by accident. See src/api/security.js.
  applyAuth(app);

  app.decorate('orchestrator', orchestrator);

  app.setErrorHandler((err, req, reply) => {
    logger.error({ err: err.message, url: req.url, statusCode: err.statusCode }, 'request failed');
    reply.status(err.statusCode || 500).send({ error: err.message });
  });

  app.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));

  await app.register(require('./routes/auth'), { prefix: '/' });
  await app.register(require('./routes/settings'), { prefix: '/' });
  await app.register(require('./routes/mailboxes'), { prefix: '/' });
  await app.register(require('./routes/emails'), { prefix: '/' });
  await app.register(require('./routes/memory'), { prefix: '/' });
  await app.register(require('./routes/knowledge'), { prefix: '/' });
  await app.register(require('./routes/opportunities'), { prefix: '/' });
  await app.register(require('./routes/dashboard'), { prefix: '/' });
  await app.register(require('./routes/ask'), { prefix: '/' });
  await app.register(require('./routes/agents'), { prefix: '/' });
  await app.register(require('./routes/ingest'), { prefix: '/' });
  await app.register(require('./routes/negotiations'), { prefix: '/' });
  await app.register(require('./routes/backup'), { prefix: '/' });
  await app.register(require('./routes/system'), { prefix: '/' });

  return app;
}

async function startServer(orchestrator) {
  await authService.ensureBootstrapUser();
  const app = await buildServer(orchestrator);
  await app.listen({ port: config.server.port, host: config.server.host });
  logger.info(`[Server] MailOS listening on http://${config.server.host}:${config.server.port} — UI at /login.html`);
  return app;
}

module.exports = { buildServer, startServer };
