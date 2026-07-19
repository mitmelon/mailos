const crypto = require('crypto');
const config = require('../config');

const ALGO = 'aes-256-gcm';

/** Encrypts mailbox credentials (IMAP passwords, OAuth tokens) at rest. */
function encrypt(plainText) {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from(config.security.encryptionKey);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decrypt(payload) {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const key = Buffer.from(config.security.encryptionKey);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };
