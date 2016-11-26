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
  update(github_id, cohort_id, success_criteria_id, checked) {
    return this.evidences
      .findOneAndUpdate({
        github_id,
        cohort_id,
        success_criteria_id
      }, {
        github_id,
        cohort_id,
        success_criteria_id,
        checked
      }, {
        upsert: true
      });
  }
}

module.exports = Evidence;
