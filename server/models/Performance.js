class Performance {
  constructor(db) {
    this.performances = db.get('performances');
    this.performances.index('cohort_id');
    this.performances.index('user_id');
    this.performances.index('standard_id');
  }
  insert(cohort_id, user_id, standard_id, score) {
    return this.performances.insert({
      cohort_id,
      user_id,
      standard_id,
      score,
      date: new Date()
    });
  }
}

module.exports = Performance;
