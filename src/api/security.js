const config = require('../config');
const logger = require('../core/Logger');
const authService = require('../services/AuthService');

// Routes/prefixes reachable without a key or session — the UI shell itself
// (static HTML/CSS/JS contains no secrets) and the auth endpoints needed to
// log in in the first place.
const PUBLIC_ROUTES = new Set(['/health', '/auth/status', '/auth/register', '/auth/login', '/auth/logout']);
const PUBLIC_PREFIXES = ['/css/', '/js/', '/img/'];
const PUBLIC_FILES = new Set(['/', '/login.html', '/app.html', '/favicon.ico', '/logo.png']);

function isPublic(url) {
  const path = url.split('?')[0];
  return PUBLIC_ROUTES.has(path) || PUBLIC_FILES.has(path) || PUBLIC_PREFIXES.some((p) => path.startsWith(p));
}

function extractApiKey(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  if (req.headers['x-api-key']) return String(req.headers['x-api-key']).trim();
  return null;
}

/**
 * Two independent ways to authenticate, either is sufficient:
 *   - API key (Authorization: Bearer / x-api-key) — for external/programmatic clients.
 *   - Session cookie (username/password login) — for the browser UI. Always
 *     enforced regardless of whether API_KEYS is configured, since it's the
 *     primary gate for the UI this app ships with.
 *
 * Applied directly on the top-level Fastify instance (not via app.register)
 * so plugin encapsulation can't accidentally scope it away from a route.
 */
function applyAuth(app) {
  const { apiKeys } = config.security;

  if (apiKeys.length === 0) {
    logger.warn('[Auth] No API_KEYS configured — external/programmatic API access will rely on the session cookie only. Set API_KEYS in .env to also allow key-based access.');
  } else {
    logger.info(`[Auth] API key authentication available (${apiKeys.length} key${apiKeys.length > 1 ? 's' : ''} configured)`);
  }

  app.addHook('onRequest', async (req, reply) => {
    if (isPublic(req.url)) return;

    const key = extractApiKey(req);
    if (key && apiKeys.includes(key)) return; // valid API key

    const token = req.cookies?.[authService.SESSION_COOKIE];
    const session = token ? authService.verifySession(token) : null;
    if (session) { req.user = { id: session.sub, username: session.username }; return; } // valid session

    reply.status(401).send({ error: 'Unauthorized — log in, or provide a valid API key via "Authorization: Bearer <key>" or "x-api-key".' });
  });
}

module.exports = { applyAuth, PUBLIC_ROUTES };
