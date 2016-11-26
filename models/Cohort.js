class Cohort {
  constructor(db) {
    this.cohorts = db.get('cohorts');
    this.cohorts.index('cohort_id');
  }
  find(cohort_id) {
    return this.cohorts
      .find({
        cohort_id
      });
  }
  insert(cohort) {
    return this.cohorts
      .insert(cohort);
  }
  assignStandard(cohort_id, standard_id, assign) {
    return this.cohorts
      .update({
        cohort_id
      }, {
        $set: {
          [`standards.${standard_id}.assigned`]: assign
        }
      });
  }
  addStandardTag(cohort_id, standard_id, tagName, value) {
    return this.cohorts
      .update({
        cohort_id
      }, {
        $push: {
          [`standards.${standard_id}.tags.${tagName}`]: value
        }
      });
  }
  removeStandardTag(cohort_id, standard_id, tagName, value) {
    return this.cohorts
      .update({
        cohort_id
      }, {
        $pull: {
          [`standards.${standard_id}.tags.${tagName}`]: value
        }
      });
  }
  findByGithubId(github_id) {
    return this.cohorts
      .find({}, {
        fields: {
          cohort_id: true
        },
        $or: [{
          instructors: {
            $elemMatch: {
              $in: [github_id]
            }
          }
        },{
          students: {
            $elemMatch: {
              $in: [github_id]
            }
          }
        }]
      });
  }
}

module.exports = Cohort;
