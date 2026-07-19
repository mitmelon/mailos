const { getRepository } = require('../../repositories/RepositoryFactory');

module.exports = async function memoryRoutes(app) {
  const repo = getRepository();

  // GET /memory?q=search+text&mailboxId=&limit=
  app.get('/memory', async (req) => {
    const { q, mailboxId, limit } = req.query || {};
    const { memory } = req.server.orchestrator;
    if (q) {
      const results = await memory.search(q, { limit: limit ? parseInt(limit, 10) : 10, mailboxId: mailboxId || null });
      return { query: q, results };
    }
    const all = await repo.find('memories', () => true, {
      sort: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return { count: all.length, memories: all };
  });

  app.get('/memory/:id', async (req, reply) => {
    const memory = await repo.findById('memories', req.params.id);
    if (!memory) return reply.status(404).send({ error: 'memory not found' });
    let sourceMemories = [];
    if (memory.sourceMemoryIds?.length) {
      sourceMemories = await repo.find('memories', (m) => memory.sourceMemoryIds.includes(m.id));
    }
    let sourceEmail = null;
    if (memory.sourceEmailId) sourceEmail = await repo.findById('emails', memory.sourceEmailId);
    const { embedding, ...safeMemory } = memory;
    return { memory: safeMemory, sourceMemories: sourceMemories.map(({ embedding: e2, ...rest }) => rest), sourceEmail };
  });

  app.delete('/memory/:id', async (req) => {
    await repo.delete('memories', req.params.id);
    return { deleted: req.params.id };
  });

  // POST /memory/consolidate — manually trigger a consolidation + forgetting pass
  // (also runs automatically every hour). Useful for demoing the memory
  // subsystem without waiting for the scheduled run.
  app.post('/memory/consolidate', async (req) => {
    const { memory } = req.server.orchestrator;
    const consolidation = await memory.consolidate();
    const forgetting = await memory.forgetExpired();
    return { consolidation, forgetting };
  });
};
