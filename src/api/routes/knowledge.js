const { getRepository } = require('../../repositories/RepositoryFactory');

module.exports = async function knowledgeRoutes(app) {
  const repo = getRepository();

  // GET /knowledge?limit=
  app.get('/knowledge', async (req) => {
    const { limit } = req.query || {};
    const insights = await repo.find('insights', () => true, {
      sort: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return {
      count: insights.length,
      knowledge: insights.map(({ embedding, ...rest }) => rest), // never ship raw vectors to clients
    };
  });
};
