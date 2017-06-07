class Resource {
  constructor(db) {
    this.resources = db.get('resources');
    this.resources.index('cohort_id');
    this.resources.index('standard_id');
  }
  getAll() {
    return this.resources
      .aggregate([
        { $group : { _id : "$standard_id", resources: { $push: "$$ROOT" } } }
      ]);
  }
  find(cohort_id, standard_id) {
    return this.resources
      .find({
        standard_id
      });
  }
  insert(resource) {
    return this.resources
      .insert(resource);
  }
}

module.exports = Resource;
