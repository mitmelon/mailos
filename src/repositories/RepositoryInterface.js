/**
 * Generic collection-based repository interface.
 * Both the JSON (demo) and MongoDB (production) backends implement this,
 * so agents and routes never know or care which one is active.
 */
class RepositoryInterface {
  async create(_collection, _doc) { throw new Error('create() not implemented'); }
  async find(_collection, _predicate = () => true, _opts = {}) { throw new Error('find() not implemented'); }
  async findOne(_collection, _predicate) { throw new Error('findOne() not implemented'); }
  async findById(_collection, _id) { throw new Error('findById() not implemented'); }
  async update(_collection, _id, _patch) { throw new Error('update() not implemented'); }
  async delete(_collection, _id) { throw new Error('delete() not implemented'); }
  async all(_collection) { throw new Error('all() not implemented'); }
}

module.exports = RepositoryInterface;
