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
  getAll(cohort_id) {
    return this.evidences
      .find({
        cohort_id
      });
  }
  update(github_id, cohort_id, success_criteria_id, checked, approved, approver_id) {
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
        approved,
        approver_id,
        approve_date: approved ? new Date() : null
      }, {
        upsert: true
      });
  }
  approve(github_id, cohort_id, success_criteria_id, approved, approver_id) {
    return this.evidences
    .update({
      github_id,
      cohort_id,
      success_criteria_id
    }, {
      $set: {
        approved,
        approver_id,
        approve_date: approved ? new Date() : null
      }
    })
  }
}

module.exports = Evidence;
