const dashboardService = require('../../services/DashboardService');

module.exports = async function dashboardRoutes(app) {
  // GET /dashboard?mailboxId=
  app.get('/dashboard', async (req) => {
    const { mailboxId } = req.query || {};
    return dashboardService.metrics({ mailboxId: mailboxId || null });
  });

  // GET /daily-report?mailboxId=
  app.get('/daily-report', async (req) => {
    const { mailboxId } = req.query || {};
    return dashboardService.dailyReport(mailboxId || null);
  });

  // GET /dashboard/mailboxes - per-mailbox breakdown, not just the aggregate.
  app.get('/dashboard/mailboxes', async () => {
    return { mailboxes: await dashboardService.perMailbox() };
  });
};
