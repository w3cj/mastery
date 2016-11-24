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
