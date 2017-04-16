class Resource {
  constructor(db) {
    this.resources = db.get('resources');
    this.resources.index('cohort_id');
    this.resources.index('standard_id');
  }
  getAll(cohort_id) {
    return this.resources
      .aggregate([
        { $match: { cohort_id } },
        { $group : { _id : "$standard_id", resources: { $push: "$$ROOT" } } }
      ]);
  }
  find(cohort_id, standard_id) {
    return this.resources
      .find({
        cohort_id,
        standard_id
      });
  }
  insert(resource) {
    return this.resources
      .insert(resource);
  }
}

module.exports = Resource;
