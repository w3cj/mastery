class SuccessCriteria {
  constructor(db) {
    this.successCriteria = db.get('disabled_success_criteria');
    this.successCriteria.index('cohort_id');
    this.successCriteria.index('standard_id');
    this.successCriteria.index('success_criteria_id');
  }
  getAll(cohort_id) {
    return this.successCriteria.find({
      cohort_id
    });
  }
  enable(cohort_id, standard_id, success_criteria_id) {
    return this.successCriteria.remove({
      cohort_id,
      standard_id,
      success_criteria_id
    });
  }
  disable(cohort_id, standard_id, success_criteria_id) {
    return this.successCriteria.insert({
      cohort_id,
      standard_id,
      success_criteria_id
    });
  }
}

module.exports = SuccessCriteria;
