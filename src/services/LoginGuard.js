const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('../core/Logger');

const BLOCK_FILE = path.join(__dirname, '..', '..', 'data', 'login-blocks.json');
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * "Device fingerprint" here is IP + User-Agent hashed together - a
 * reasonable server-side approximation without client-side fingerprinting
 * JS, not a claim of true device-level uniqueness.
 */
function fingerprint(req) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}::${ua}`).digest('hex').slice(0, 16);
}

class LoginGuard {
  constructor() {
    this._attempts = new Map(); // fingerprint -> { count, firstAttemptAt }
    this._loadBlocks();
  }

  _loadBlocks() {
    try {
      fs.mkdirSync(path.dirname(BLOCK_FILE), { recursive: true });
      if (fs.existsSync(BLOCK_FILE)) {
        this._blocks = JSON.parse(fs.readFileSync(BLOCK_FILE, 'utf8'));
      } else {
        this._blocks = {};
        this._saveBlocks();
      }
    } catch (err) {
      logger.error({ err: err.message }, '[LoginGuard] failed to load block file, starting empty');
      this._blocks = {};
    }
  }

  _saveBlocks() {
    try {
      fs.writeFileSync(BLOCK_FILE, JSON.stringify(this._blocks, null, 2));
    } catch (err) {
      logger.error({ err: err.message }, '[LoginGuard] failed to persist block file');
    }
  }

  /** Re-reads the block file before every check, so an admin editing it by hand takes effect immediately without a restart. */
  isBlocked(req) {
    this._loadBlocks();
    const fp = fingerprint(req);
    const entry = this._blocks[fp];
    if (!entry) return false;
    return { fingerprint: fp, blockedAt: entry.blockedAt, reason: entry.reason };
  }

  recordFailure(req, username) {
    const fp = fingerprint(req);
    const now = Date.now();
    const entry = this._attempts.get(fp);
    if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
      this._attempts.set(fp, { count: 1, firstAttemptAt: now });
      return;
    }
    entry.count += 1;
    if (entry.count >= MAX_ATTEMPTS) {
      this._loadBlocks();
      this._blocks[fp] = { blockedAt: new Date().toISOString(), reason: `${MAX_ATTEMPTS} failed login attempts`, lastUsername: username };
      this._saveBlocks();
      this._attempts.delete(fp);
      logger.warn({ fingerprint: fp }, `[LoginGuard] blocked after ${MAX_ATTEMPTS} failed login attempts — edit data/login-blocks.json to unblock`);
    }
  }

  recordSuccess(req) {
    this._attempts.delete(fingerprint(req));
  }

  unblock(fp) {
    this._loadBlocks();
    delete this._blocks[fp];
    this._saveBlocks();
  }

  listBlocks() {
    this._loadBlocks();
    return Object.entries(this._blocks).map(([fp, v]) => ({ fingerprint: fp, ...v }));
  }
}

module.exports = new LoginGuard();
