class Evidence {
  constructor(db) {
    this.evidences = db.get('evidences');
    this.evidences.index('github_id');
  }
  find(github_id) {
    return this.evidences
      .find({
        github_id
      });
  }
  update(github_id, cohort_id, success_criteria_id, checked, approved) {
    return this.evidences
      .findOneAndUpdate({
        github_id,
        cohort_id,
        success_criteria_id
      }, {
        github_id,
        cohort_id,
        success_criteria_id,
        checked,
        approved
      }, {
        upsert: true
      });
  }
  approve(github_id, cohort_id, success_criteria_id, approved) {
    return this.evidences
    .update({
      github_id,
      cohort_id,
      success_criteria_id
    }, {
      $set: {
        approved
      }
    })
  }
}

module.exports = Evidence;
