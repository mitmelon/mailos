const authService = require('../../services/AuthService');
const loginGuard = require('../../services/LoginGuard');

const loginRateLimit = { config: { rateLimit: { max: 10, timeWindow: 60000 } } };

module.exports = async function authRoutes(app) {
  app.get('/auth/status', async () => {
    const hasAdminUser = await authService.hasAdminUser();
    return { hasAdminUser };
  });

  app.post('/auth/register', async (req, reply) => {
    const { username, password } = req.body || {};
    await authService.register(username, password);
    const { token, user } = await authService.login(username, password);
    setSessionCookie(reply, token);
    return reply.send({ user });
  });

  app.post('/auth/login', loginRateLimit, async (req, reply) => {
    const blocked = loginGuard.isBlocked(req);
    if (blocked) {
      return reply.status(429).send({ error: `Too many failed login attempts. This device/network is temporarily blocked. Contact the admin if this wasn't you.` });
    }
    const { username, password } = req.body || {};
    try {
      const { token, user } = await authService.login(username, password);
      loginGuard.recordSuccess(req);
      setSessionCookie(reply, token);
      return reply.send({ user });
    } catch (err) {
      loginGuard.recordFailure(req, username);
      throw err;
    }
  });

  app.post('/auth/logout', async (req, reply) => {
    reply.clearCookie(authService.SESSION_COOKIE, { path: '/' });
    return reply.send({ loggedOut: true });
  });

  app.get('/auth/me', async (req, reply) => {
    const token = req.cookies?.[authService.SESSION_COOKIE];
    const session = token ? authService.verifySession(token) : null;
    if (!session) return reply.status(401).send({ error: 'not logged in' });
    return reply.send({ user: { id: session.sub, username: session.username } });
  });
};

function setSessionCookie(reply, token) {
  reply.setCookie(authService.SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
}
