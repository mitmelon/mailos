const settingsService = require('../../services/SettingsService');

module.exports = async function settingsRoutes(app) {
  app.get('/settings', async () => {
    return { settings: await settingsService.getMasked() };
  });

  // PATCH /settings — any subset of: qwenApiKey, qwenBaseUrl, qwenModel,
  // qwenEmbeddingModel, negotiationMaxRounds, negotiationMaxDiscountPercent,
  // negotiationRequireApprovalAboveAmount, negotiationMinConfidenceToAutoSend.
  // Takes effect immediately — QwenProvider reads settings fresh on every call.
  app.patch('/settings', async (req, reply) => {
    await settingsService.update(req.body || {});
    return reply.send({ settings: await settingsService.getMasked() });
  });
};
