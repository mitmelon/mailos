const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const AgentBase = require('../core/AgentBase');
const topics = require('../core/topics');
const { encrypt, decrypt } = require('../utils/security');
const { getRepository } = require('../repositories/RepositoryFactory');
const { withBackoff } = require('../utils/retry');
const errorLog = require('../services/ErrorLogService');

const FIRST_SYNC_MAX_MESSAGES = 200;

class EmailConnector extends AgentBase {
  static type = 'email';

  constructor() {
    super('EmailConnector');
    this.repo = getRepository();
    this._imapConnections = new Map();
    this._reconnecting = new Set();
  }

  async init() {
    this.log.info('EmailConnector online - ready to connect mailboxes');
    this.on(topics.EMAIL_SEND_REQUESTED, this.handleSendRequested);
    const mailboxes = await this.repo.find('mailboxes', (m) => m.status === 'connected' || m.status === 'reconnecting');
    for (const mailbox of mailboxes) {
      this._startMonitoringWithRetry(mailbox);
    }
  }

  async ingest(mailboxId, fields) {
    const mailbox = mailboxId ? await this.repo.findById('mailboxes', mailboxId) : null;
    return this._ingest(mailbox || { id: mailboxId || 'unassigned' }, {
      externalId: fields.externalId || `ingest-${Date.now()}`,
      from: fields.from || 'unknown@example.com',
      to: fields.to || 'me@example.com',
      subject: fields.subject || '(no subject)',
      text: fields.text || '',
      html: fields.html || '',
      attachments: fields.attachments || [],
      messageId: fields.messageId || null,
      inReplyTo: fields.inReplyTo || null,
      references: fields.references || [],
      receivedAt: new Date(),
    });
  }

  async connect(credentials) { return this.connectImap(credentials); }
  async startMonitoring(connection) { return this._startMonitoring(connection); }
  async sync(connectionId) { return this.syncMailbox(connectionId); }

  /** Verifies credentials with a real connection attempt and maps common IMAP failures to messages a non-technical user can act on. */
  async connectImap({ host, port = 993, user, password, tls = true, smtpHost, smtpPort = 587, label, webhookUrl, negotiationPolicy, profile }) {
    if (!host || !user || !password || !smtpHost) {
      const err = new Error('host, user, password, and smtpHost are required.');
      err.statusCode = 400;
      throw err;
    }

    let probe;
    try {
      probe = new ImapFlow({ host, port, secure: tls, auth: { user, pass: password }, logger: false, connectionTimeout: 15000 });
      await probe.connect();
      await probe.getMailboxLock('INBOX').then((lock) => lock.release());
    } catch (rawErr) {
      throw this._friendlyImapError(rawErr, host);
    } finally {
      try { await probe?.logout(); } catch { /* already broken, nothing to clean up */ }
    }

    const mailbox = await this.repo.create('mailboxes', {
      type: 'imap',
      label: label || user,
      emailAddress: user,
      credentials: encrypt(JSON.stringify({ host, port, user, password, tls, smtpHost, smtpPort })),
      status: 'connected',
      lastSyncAt: null,
      lastUid: 0,
      sentCount: 0,
      webhookUrl: webhookUrl || null,
      negotiationPolicy: negotiationPolicy || null,
      profile: profile || { calendar: null, priorities: [], location: null, preferences: {}, documents: [] },
    });
    this._startMonitoringWithRetry(mailbox);
    return mailbox;
  }

  _friendlyImapError(rawErr, host) {
    const msg = String(rawErr?.message || rawErr);
    let friendly;
    if (rawErr?.authenticationFailed || /invalid credentials|authentication failed|AUTHENTICATIONFAILED/i.test(msg)) {
      friendly = 'Login rejected - check the username and password (for Gmail/Outlook/Yahoo you likely need an app password, not your normal account password).';
    } else if (/ENOTFOUND|EAI_AGAIN/.test(msg)) {
      friendly = `Could not resolve host "${host}" - check the IMAP host address for typos.`;
    } else if (/ECONNREFUSED/.test(msg)) {
      friendly = `Connection refused by ${host} - check the port and that IMAP access is enabled on this account.`;
    } else if (/ETIMEDOUT|timed out/i.test(msg)) {
      friendly = `Connection to ${host} timed out - check the host/port and that nothing is blocking outbound IMAP traffic.`;
    } else if (/certificate|SSL|TLS/i.test(msg)) {
      friendly = 'TLS/certificate error connecting to the mail server - verify the port matches the TLS setting (993 for TLS, 143 for plain).';
    } else {
      friendly = `Could not connect: ${msg}`;
    }
    const err = new Error(friendly);
    err.statusCode = 422;
    err.cause = msg;
    return err;
  }

  async disconnect(mailboxId) {
    this._reconnecting.delete(mailboxId);
    const client = this._imapConnections.get(mailboxId);
    if (client) { try { await client.logout(); } catch { /* connection may already be dead */ } this._imapConnections.delete(mailboxId); }
    await this.repo.update('mailboxes', mailboxId, { status: 'disconnected' });
    return true;
  }

  _startMonitoringWithRetry(mailbox) {
    if (this._reconnecting.has(mailbox.id)) return;
    this._reconnecting.add(mailbox.id);

    withBackoff(() => this._monitorImap(mailbox), {
      maxRetries: Infinity,
      baseDelayMs: 2000,
      maxDelayMs: 60000,
      label: `IMAP reconnect for mailbox ${mailbox.id}`,
    })
      .then(() => {
        this._reconnecting.delete(mailbox.id);
        this.repo.update('mailboxes', mailbox.id, { status: 'connected' });
      })
      .catch(async (err) => {
        this._reconnecting.delete(mailbox.id);
        await errorLog.record({ source: 'EmailConnector', mailboxId: mailbox.id, message: `Mailbox permanently failed to (re)connect: ${err.message}` });
      });
  }

  async _startMonitoring(mailbox) { return this._monitorImap(mailbox); }

  async _monitorImap(mailbox) {
    const creds = JSON.parse(decrypt(mailbox.credentials));
    const client = new ImapFlow({
      host: creds.host, port: creds.port, secure: creds.tls,
      auth: { user: creds.user, pass: creds.password },
      logger: false,
    });
    await client.connect();
    this._imapConnections.set(mailbox.id, client);

    await this._fetchNewImapMail(mailbox.id, client);

    client.on('exists', () => {
      this._fetchNewImapMail(mailbox.id, client).catch((err) => errorLog.record({ source: 'EmailConnector', mailboxId: mailbox.id, message: `IDLE fetch failed: ${err.message}` }));
    });

    const handleDrop = (reason) => async () => {
      this._imapConnections.delete(mailbox.id);
      const current = await this.repo.findById('mailboxes', mailbox.id);
      if (!current || current.status === 'disconnected') return;
      this.log.warn({ mailboxId: mailbox.id, reason }, 'IMAP connection lost - reconnecting');
      await this.repo.update('mailboxes', mailbox.id, { status: 'reconnecting' });
      this._startMonitoringWithRetry(current);
    };
    client.on('close', handleDrop('close'));
    client.on('error', (err) => { errorLog.record({ source: 'EmailConnector', mailboxId: mailbox.id, message: `IMAP connection error: ${err.message}` }); handleDrop('error')(); });

    this.log.info({ mailboxId: mailbox.id }, 'IMAP IDLE monitoring started (imapflow)');
  }

  /**
   * First sync after connecting pulls recent history (capped at
   * FIRST_SYNC_MAX_MESSAGES) so MailOS has something to learn from
   * immediately, instead of only reacting to mail from this point forward.
   * Every sync after that is a pure incremental UID fetch.
   *
   * Takes a mailboxId, not a mailbox object — every call re-reads the
   * mailbox's current lastUid fresh from the repository. This is
   * deliberate: a snapshot captured once at connect time and reused across
   * every subsequent IDLE 'exists' event would never see its own updates,
   * causing the same messages to be endlessly re-fetched and duplicated.
   */
  async _fetchNewImapMail(mailboxId, client) {
    const mailbox = await this.repo.findById('mailboxes', mailboxId);
    if (!mailbox) return;
    const lock = await client.getMailboxLock('INBOX');
    let maxUid = mailbox.lastUid || 0;
    try {
      let range;
      if (mailbox.lastUid) {
        range = `${mailbox.lastUid + 1}:*`;
      } else {
        const exists = client.mailbox?.exists || 0;
        if (!exists) { lock.release(); return; }
        const startSeq = Math.max(1, exists - FIRST_SYNC_MAX_MESSAGES + 1);
        const uids = await client.search({ seq: `${startSeq}:*` }, { uid: true });
        if (!uids || !uids.length) { lock.release(); return; }
        range = uids;
      }

      for await (const msg of client.fetch(range, { envelope: true, source: true, uid: true }, { uid: true })) {
        if (msg.uid <= (mailbox.lastUid || 0)) continue;
        const parsed = await simpleParser(msg.source);
        await this._ingest(mailbox, {
          externalId: String(msg.uid),
          from: parsed.from?.text || '',
          to: parsed.to?.text || '',
          subject: parsed.subject || '(no subject)',
          text: parsed.text || '',
          html: parsed.html || '',
          attachments: (parsed.attachments || []).map((a) => ({ filename: a.filename, size: a.size })),
          messageId: parsed.messageId || null,
          inReplyTo: parsed.inReplyTo || null,
          references: Array.isArray(parsed.references) ? parsed.references : (parsed.references ? [parsed.references] : []),
          receivedAt: parsed.date || new Date(),
        });
        maxUid = Math.max(maxUid, msg.uid);
      }
    } catch (err) {
      await errorLog.record({ source: 'EmailConnector', mailboxId: mailbox.id, message: `Fetching new mail failed: ${err.message}` });
    } finally {
      lock.release();
    }
    if (maxUid !== mailbox.lastUid) {
      await this.repo.update('mailboxes', mailbox.id, { lastUid: maxUid, lastSyncAt: new Date().toISOString() });
    }
  }

  /** Defense in depth against duplicate ingestion: skips creating a record for a message already stored for this mailbox, keyed by Message-ID first (most reliable, globally unique) and falling back to mailbox+externalId. */
  async _ingest(mailbox, raw) {
    const duplicate = raw.messageId
      ? await this.repo.findOne('emails', (e) => e.mailboxId === mailbox.id && e.messageId === raw.messageId)
      : await this.repo.findOne('emails', (e) => e.mailboxId === mailbox.id && e.externalId === raw.externalId);
    if (duplicate) return duplicate;

    const email = await this.repo.create('emails', {
      mailboxId: mailbox.id,
      externalId: raw.externalId,
      from: raw.from,
      to: raw.to,
      subject: raw.subject,
      text: raw.text,
      html: raw.html,
      attachments: raw.attachments,
      messageId: raw.messageId,
      inReplyTo: raw.inReplyTo,
      references: raw.references || [],
      receivedAt: raw.receivedAt,
      status: 'received',
    });
    await this.emit(topics.EMAIL_RECEIVED, { emailId: email.id });
    return email;
  }

  async syncMailbox(mailboxId) {
    const mailbox = await this.repo.findById('mailboxes', mailboxId);
    if (!mailbox) throw new Error('mailbox not found');
    let client = this._imapConnections.get(mailboxId);
    let temporary = false;
    if (!client) {
      const creds = JSON.parse(decrypt(mailbox.credentials));
      client = new ImapFlow({ host: creds.host, port: creds.port, secure: creds.tls, auth: { user: creds.user, pass: creds.password }, logger: false });
      await client.connect();
      temporary = true;
    }
    try {
      await this._fetchNewImapMail(mailboxId, client);
    } finally {
      if (temporary) await client.logout().catch(() => {});
    }
    return this.repo.findById('mailboxes', mailboxId);
  }

  async handleSendRequested(payload) {
    const { mailboxId, to, subject, body, inReplyTo, references } = payload;
    try {
      const info = await this.send(mailboxId, { to, subject, body, inReplyTo, references });
      if (info.rejected && info.rejected.length) {
        await errorLog.record({
          source: 'EmailConnector', mailboxId,
          message: `SMTP accepted the connection but rejected the recipient: ${info.rejected.join(', ')}`,
          context: { to, subject, response: info.response },
        });
        return;
      }
      const mailbox = await this.repo.findById('mailboxes', mailboxId);
      if (mailbox) await this.repo.update('mailboxes', mailboxId, { sentCount: (mailbox.sentCount || 0) + 1 });
      await this.emit(topics.EMAIL_SENT, { mailboxId, to, subject, messageId: info.messageId, meta: payload.meta });
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      const errorDetails = {
        source: 'EmailConnector',
        mailboxId,
        message: `Send failed: ${errorMsg}`,
        context: { to, subject }
      };
      // Add specific guidance for common errors
      if (errorMsg.includes('Connection timeout') || errorMsg.includes('ETIMEDOUT')) {
        errorDetails.message = 'Send failed: SMTP connection timeout. Check SMTP host, port, and firewall settings.';
      } else if (errorMsg.includes('Authentication') || errorMsg.includes('Invalid login')) {
        errorDetails.message = 'Send failed: SMTP authentication failed. Check email credentials in mailbox settings.';
      } else if (errorMsg.includes('self signed') || errorMsg.includes('certificate')) {
        errorDetails.message = 'Send failed: SSL/TLS certificate error. Check if SMTP server requires TLS.';
      }
      await errorLog.record(errorDetails);
      // Log to console for immediate visibility
      this.log.error({ err: errorMsg, mailboxId, to, subject }, 'Failed to send email');
    }
  }

  async send(mailboxId, { to, subject, body, inReplyTo, references }) {
    const mailbox = await this.repo.findById('mailboxes', mailboxId);
    if (!mailbox) throw new Error('mailbox not found');
    const creds = JSON.parse(decrypt(mailbox.credentials));
    const transporter = nodemailer.createTransport({
      host: creds.smtpHost,
      port: creds.smtpPort,
      secure: creds.smtpPort === 465,
      auth: { user: creds.user, pass: creds.password },
      connectionTimeout: 10000, // 10 seconds to establish connection
      socketTimeout: 30000, // 30 seconds for the entire send operation
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
    return transporter.sendMail({
      from: creds.user, to, subject, text: body,
      inReplyTo: inReplyTo || undefined,
      references: references && references.length ? references.join(' ') : undefined,
    });
  }
}

module.exports = EmailConnector;
