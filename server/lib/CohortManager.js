const {fetchCohortData, fetchPerformances} = require('./learnInterface');
const {Cohort, Student, Instructor} = require('../models');
const {resUnAuthorized} = require('./routeHelpers');

class CohortManager {
  constructor() {
    this.fetching = {};
    this.waiting = {};
  }

  getCohorts(github_id) {
    return Cohort.findByGithubId(github_id);
  }

  getCohort(cohort_id) {
    return this.waitFindCohort(cohort_id);
  }

  getStandards(cohort_id) {
    return this.waitFindGetProperty(cohort_id, 'standards');
  }

  getStandard(cohort_id, standard_id) {
    return this.waitFindGetProperty(cohort_id, 'standards')
      .then(standards => {
        return standards[standard_id];
      });
  }

  getSubjects(cohort_id) {
    return this.waitFindGetProperty(cohort_id, 'subjects');
  }

  getSubject(cohort_id, name) {
    return this.waitFindGetProperty(cohort_id, 'subjects')
      .then(subjects => {
        return subjects[name];
      });
  }

  getStudents(cohort_id) {
    return this
      .waitFindGetProperty(cohort_id, 'students')
      .then((ids) => Student.findByIds(ids.filter(id => id != null)));
  }

  getInstructors(cohort_id) {
    return this
      .waitFindGetProperty(cohort_id, 'instructors')
      .then((ids) => Instructor.findByIds(ids));
  }

  getPerformances(cohort_id, user_id) {
    return fetchPerformances(cohort_id, user_id);
  }

  waitFindGetProperty(cohort_id, property) {
    return this.waitFindCohort(cohort_id)
      .then(data => {
        return data[property];
      });
  }

  waitFindCohort(cohort_id) {
    if(!this.fetching[cohort_id]) {
      this.fetching[cohort_id] = true;
      this.waiting[cohort_id] = [];
      const waiter = new Promise((resolve, reject) => {
        this.waiting[cohort_id].push({resolve, reject});
      });

      Cohort
        .find(cohort_id)
        .then(cohort => {
          if(cohort && cohort.length > 0) {
            this.resolveWaiting(cohort_id, cohort[0]);
          } else {
            return fetchCohortData(cohort_id)
              .then(data => {
                return Cohort
                  .insert(data);
              }).then(data => {
                this.resolveWaiting(cohort_id, data);
              });
          }
        }).catch(error => {
          this.rejectWaiting(cohort_id, error);
        });

      return waiter;
    } else {
      return new Promise((resolve, reject) => {
        this.waiting[cohort_id].push({resolve, reject});
      });
    }
  }

  clearWaiting(action, cohort_id, data) {
    this.waiting[cohort_id].forEach(promise => {
      promise[action](data);
    });
    this.waiting[cohort_id] = [];
    this.fetching[cohort_id] = false;
  }

  resolveWaiting(cohort_id, data) {
    this.clearWaiting('resolve', cohort_id, data);
  }

  rejectWaiting(cohort_id, error) {
    this.clearWaiting('reject', cohort_id, error);
  }

  isInstructor(req, res, next) {
    if(req.user.isInstructor) {
      next();
    } else {
      resUnAuthorized(res);
    }
  }
}

module.exports = new CohortManager();
