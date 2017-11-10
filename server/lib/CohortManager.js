const {fetchCohortData, getUserPerformances, getAverageStudentPerformances, setUserPerformance} = require('./learn/learnInterface');
const {Student, Instructor, Performance} = require('../models');

class CohortManager {
  constructor() {
    this.fetching = {};
    this.waiting = {};
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
    return getUserPerformances(cohort_id, user_id);
  }

  getAverageStudentPerformances(cohort_id, user_id) {
    return getAverageStudentPerformances(cohort_id, user_id);
  }

  setPerformance(cohort_id, user_id, standard_id, score) {
    return Performance
      .insert(cohort_id, user_id, standard_id, score)
      .then(() => {
        return setUserPerformance(cohort_id, user_id, standard_id, score);
      });
  }

  waitFindGetProperty(cohort_id, property) {
    return this.waitFindCohort(cohort_id)
      .then(data => {
        return data[property];
      });
  }

  waitFindCohort(cohort_id) {
    return fetchCohortData(cohort_id);
  }
}

module.exports = new CohortManager();
