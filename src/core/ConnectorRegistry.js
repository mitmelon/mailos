const logger = require('./Logger');

/**
 * Holds every active connector, keyed by its ConnectorInterface.type
 * (e.g. "email"). This is the plugin surface: a new connector is
 * built by implementing ConnectorInterface and calling register() —
 * nothing else in the engine needs to know it exists.
 */
class ConnectorRegistry {
  constructor() {
    this._connectors = new Map();
  }

  register(connectorInstance) {
    const type = connectorInstance.constructor.type;
    if (!type) throw new Error(`Connector ${connectorInstance.constructor.name} must declare a static "type"`);
    this._connectors.set(type, connectorInstance);
    logger.info(`[ConnectorRegistry] registered connector: "${type}"`);
  }

  get(type) {
    const connector = this._connectors.get(type);
    if (!connector) throw new Error(`No connector registered for type "${type}". Available: ${[...this._connectors.keys()].join(', ') || '(none)'}`);
    return connector;
  }

  has(type) {
    return this._connectors.has(type);
  }

  list() {
    return [...this._connectors.keys()];
  }
}

module.exports = ConnectorRegistry;
