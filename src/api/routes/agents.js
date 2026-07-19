module.exports = async function agentRoutes(app) {
  app.get('/agents/status', async (req) => {
    return { agents: req.server.orchestrator.status() };
  });
};
