const jwt = require('jsonwebtoken');
const { getRepository } = require('../repositories/RepositoryFactory');
const { hashPassword, verifyPassword } = require('../utils/passwords');
const config = require('../config');
const logger = require('../core/Logger');

const SESSION_COOKIE = 'mailos_session';
const SESSION_TTL = '7d';

class AuthService {
  constructor() {
    this.repo = getRepository();
  }

  async hasAdminUser() {
    const users = await this.repo.all('users');
    return users.length > 0;
  }

  /**
   * Creates the single admin account — this project has no multi-user
   * registration. Refuses if an account already exists, whether this call
   * came from the UI's first-run setup page or the .env bootstrap.
   */
  async register(username, password) {
    if (await this.hasAdminUser()) {
      const err = new Error('An admin account already exists — registration is only available on first run.');
      err.statusCode = 409;
      throw err;
    }
    if (!username || !password || password.length < 8) {
      const err = new Error('username and a password of at least 8 characters are required.');
      err.statusCode = 400;
      throw err;
    }
    const passwordHash = await hashPassword(password);
    return this.repo.create('users', { username, passwordHash });
  }

  /** Seeds the admin account from ADMIN_USERNAME/ADMIN_PASSWORD if set and no account exists yet — an alternative to the UI setup page. */
  async ensureBootstrapUser() {
    if (await this.hasAdminUser()) return;
    const { bootstrapAdminUsername, bootstrapAdminPassword } = config.security;
    if (!bootstrapAdminUsername || !bootstrapAdminPassword) return;
    await this.register(bootstrapAdminUsername, bootstrapAdminPassword);
    logger.info(`[Auth] Admin account bootstrapped from ADMIN_USERNAME/.env for "${bootstrapAdminUsername}"`);
  }

  async login(username, password) {
    const user = await this.repo.findOne('users', { username });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      const err = new Error('Invalid username or password.');
      err.statusCode = 401;
      throw err;
    }
    const token = jwt.sign({ sub: user.id, username: user.username }, config.security.jwtSecret, { expiresIn: SESSION_TTL });
    return { token, user: { id: user.id, username: user.username } };
  }

  verifySession(token) {
    try {
      return jwt.verify(token, config.security.jwtSecret);
    } catch {
      return null;
    }
  }
}

module.exports = new AuthService();
module.exports.SESSION_COOKIE = SESSION_COOKIE;
