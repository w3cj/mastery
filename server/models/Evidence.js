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
  update(github_id, cohort_id, success_criteria_id, checked, approver_id, approved) {
    const update = {
      github_id,
      cohort_id,
      success_criteria_id,
      checked,
      approver_id
    };

    if(typeof approved == 'boolean') {
      update.approved = approved;
      update.approve_date = approved ? new Date() : null;
    }

    return this.evidences
      .findOneAndUpdate({
        github_id,
        cohort_id,
        success_criteria_id
      }, update, {
        upsert: true
      });
  }
  approve(github_id, cohort_id, success_criteria_id, approver_id, approved) {
    const $set = {
      approver_id,
      approve_date: approved ? new Date() : null
    };

    if(typeof approved == 'boolean') $set.approved = approved;

    return this.evidences
    .update({
      github_id,
      cohort_id,
      success_criteria_id
    }, {
      $set
    })
  }
}

module.exports = Evidence;
