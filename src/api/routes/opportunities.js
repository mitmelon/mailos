const { getRepository } = require('../../repositories/RepositoryFactory');

module.exports = async function opportunityRoutes(app) {
  const repo = getRepository();

  app.get('/opportunities', async (req) => {
    const opportunities = await repo.find('opportunities', () => true, {
      sort: (a, b) => (b.mentions || 0) - (a.mentions || 0),
    });
    return { count: opportunities.length, opportunities: opportunities.map(({ embedding, ...rest }) => rest) };
  });
};
