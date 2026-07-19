/**
 * A Connector bridges an external channel (email, Slack, GitHub, calendar, CRM...)
 * into MailOS's channel-agnostic agent pipeline. Every connector normalizes its
 * source data into the same generic "message" shape and hands it to
 * `ingest()` — from that point on, Guardian/Classification/Memory/Decision/etc.
 * never know or care which channel it came from.
 *
 * To add a new connector: implement this interface, give it a unique
 * static `type`, and register it with ConnectorRegistry. Nothing else
 * in the engine needs to change.
 *
 * Only EmailConnector is implemented in this repo. This interface and
 * the registry below are the real, working extension point — not a
 * promise of connectors that don't exist yet.
 */
class ConnectorInterface {
  static type = 'base';

  /** Establish a connection (auth, verify credentials) and persist it. Returns the stored connection record. */
  async connect(_credentials) { throw new Error('connect() not implemented'); }

  /** Tear down a connection. */
  async disconnect(_connectionId) { throw new Error('disconnect() not implemented'); }

  /** Start continuous listening (push/IDLE/webhook/poll — whatever fits the channel). */
  async startMonitoring(_connection) { throw new Error('startMonitoring() not implemented'); }

  /** On-demand fetch of anything new since the last sync. */
  async sync(_connectionId) { throw new Error('sync() not implemented'); }

  /** Send an outbound message/action back through this channel. */
  async send(_connectionId, _payload) { throw new Error('send() not implemented'); }
}

module.exports = ConnectorInterface;
