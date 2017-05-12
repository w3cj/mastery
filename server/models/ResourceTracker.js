class ResourceTracker {
  constructor(db) {
    this.trackers = db.get('resource-tracker');
    this.trackers.index('cohort_id');
    this.trackers.index('resource_id');
  }
  getAllCohort(cohort_id) {
    return this.trackers.find({
      cohort_id
    })
  }
  getAllStudent(cohort_id, student_id) {
    return this.trackers
      .find({
        cohort_id,
        student_id
      });
  }
  done(cohort_id, student_id, resource_id, checked) {
    const $set = {
      checked,
      done_date: checked ? new Date() : null
    };

    $set.checkedout = false;
    
    if(!checked) {
      $set.checkout_date = null;
    }

    return this.trackers
      .findOneAndUpdate({
        cohort_id,
        student_id,
        resource_id
      }, {
        $set
      }, {
        upsert: true
      });
  }
  checkout(cohort_id, student_id, resource_id) {
    const $set = {
      checkedout: true,
      checkout_date: new Date()
    };

    return this.trackers
      .findOneAndUpdate({
        cohort_id,
        student_id,
        resource_id
      }, {
        $set
      }, {
        upsert: true
      });
  }
}

module.exports = ResourceTracker;
