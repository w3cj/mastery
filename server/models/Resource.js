class Resource {
  constructor(db) {
    this.resources = db.get('resources');
    this.resources.index('standard_id');
  }
  find(standard_id) {
    return this.resources
      .findOne({
        standard_id
      });
  }
  insert(resource) {
    return this.resources
      .insert(resource);
  }
}

module.exports = Resource;
