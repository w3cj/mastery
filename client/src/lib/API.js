import fetch from 'isomorphic-fetch';

import {
  fetchJSON,
  postJSON,
  deleteJSON,
  fetchWithBody
} from './fetch';

class API {
  constructor() {
    this.cache = {};
    this.cacheify('getCohorts');
    this.cacheify('getCohort');
    this.cacheify('getStudent');
    this.cacheify('getStudents');
    this.cacheify('getStudentImages');
    this.cacheify('getAllCohorts');
  }
  cacheify(name) {
    const original = this[name];
    this[name] = (function () {
      const cacheName = `${name}-${Array.prototype.join.call(arguments, ',')}`;
      if(this.cache[cacheName]) {
        return Promise.resolve(this.cache[cacheName]);
      } else {
        return original.apply(this, arguments)
          .then(data => {
            this.cache[cacheName] = data;
            return data;
          });
      }
    }).bind(this);
  }
  getExchange() {
    return fetchJSON('auth/exchange');
  }
  getAllCohorts() {
    return fetchJSON('learn/cohorts/all')
      .then(result => {
        return result.data.map(cohort => {
          cohort.data.attributes.cohort_id = cohort.data.id;
          return cohort.data.attributes;
        });
      });
  }
  getCohorts(user_id) {
    if(user_id) {
      return fetchJSON(`learn/cohorts/${user_id}`);
    } else {
      return fetchJSON('learn/cohorts');
    }
  }
  getDefaultCohort() {
    if(localStorage.defaultCohort) return Promise.resolve(localStorage.defaultCohort);

    return this
            .getCohorts()
            .then(cohorts => {
              const defaultCohort = Math.max.apply(null, cohorts.map(c => Number(c.cohort_id)));
              localStorage.defaultCohort = defaultCohort;
              return defaultCohort;
            });
  }
  getCohort(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}`)
      .then(cohort => {
        cohort.subjectsById = cohort.subjects.reduce((subjects, subject) => {
          subjects[subject.id] = subject;
          return subjects;
        }, {});
        Object.keys(cohort.standards).forEach(standard_id => {
          const standard = cohort.standards[standard_id];
          standard.assigning = false;
          const subject = cohort.subjectsById[standard.subject_id];
          subject.standards = subject.standards || [];
          subject.standards.push(standard);
          subject.text = subject.name;
        });
        return cohort;
      });
  }
  getEvidences(student_id) {
    return fetchJSON(`evidence/${student_id}`)
      .then(evidences => {
        return evidences.reduce((evidences, evidence) => {
          evidences[evidence.success_criteria_id] = evidence;
          return evidences;
        }, {});
      });
  }
  getPerformances(cohort_id) {
    return fetchJSON(`learn/cohorts/${cohort_id}/performances`);
  }
  getAveragePerformances(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/performances/average`);
  }
  getStudentPerformances(cohort_id, user_id) {
    return fetchJSON(`cohorts/${cohort_id}/performances/${user_id}`);
  }
  getStudents(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/students`);
  }
  getStudent(cohort_id, student_id) {
    return this.getStudentImages(cohort_id)
      .then((students) => students.filter(s => s.id == student_id)[0]);
  }
  getStudentImages(cohort_id) {
    return fetchJSON(`learn/cohorts/${cohort_id}/student-images`);
  }
  checkSuccessCriteria(user_id, cohort_id, success_criteria_id, checked) {
    return postJSON(`evidence/${user_id}`, {cohort_id, success_criteria_id, checked});
  }
  assignStandard(cohort_id, standard_id, assign = true) {
    return postJSON(`cohorts/${cohort_id}/standards/${standard_id}/assign`, {assign});
  }
  addStandardTag(cohort_id, standard_id, tagName, value) {
    return postJSON(`cohorts/${cohort_id}/standards/${standard_id}/tag`, { tagName, value });
  }
  removeStandardTag(cohort_id, standard_id, tagName, value) {
    return deleteJSON(`cohorts/${cohort_id}/standards/${standard_id}/tag`, { tagName, value });
  }
}

export default new API();
