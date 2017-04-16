class StandardCollection {
  constructor(db) {
    this.standardCollections = db.get('standard_collection');
    this.standardCollections.index('cohort_id');
  }
  find(cohort_id, collection_name) {
    return this.standardCollections
      .findOne({
        cohort_id,
        collection_name
      });
  }
  getAll(cohort_id) {
    return this.standardCollections
      .find({
        cohort_id
      });
  }
  addStandard(cohort_id, collection_name, standard_id) {
    return this.standardCollections
      .update({
        cohort_id,
        collection_name
      }, {
        $set: {
          updated: new Date()
        },
        $addToSet: {
          standards: standard_id
        }
      }, {
        upsert: true
      });
  }
  removeStandard(cohort_id, collection_name, standard_id) {
    return this.standardCollections
      .update({
        cohort_id,
        collection_name
      }, {
        $set: {
          updated: new Date()
        },
        $pull: {
          standards: standard_id
        }
      });
  }
}

module.exports = StandardCollection;
