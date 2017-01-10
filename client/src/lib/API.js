import fetch from 'isomorphic-fetch';

import {
  fetchJSON,
  postJSON,
  deleteJSON,
  fetchWithBody
} from './fetch';

class API {
  getExchange() {
    return fetchJSON('auth/exchange');
  }
  getCohorts() {
    return fetchJSON('learn/cohorts');
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
          if(!standard.tags) standard.tags = {};
          standard.tags.quarters = standard.tags.quarters || [];
          standard.tags.weeks = standard.tags.weeks || [];
          standard.selectedQuarter = "";
          const subject = cohort.subjectsById[standard.subject_id];
          subject.standards = subject.standards || [];
          subject.standards.push(standard);
        });
        return cohort;
      });
  }
  getEvidences() {
    return fetchJSON(`evidence`)
      .then(evidences => {
        return evidences.reduce((evidences, evidence) => {
          evidences[evidence.success_criteria_id] = evidence;
          return evidences;
        }, {});
      });
  }
  getPerformances(cohort_id, user_id) {
    return fetchJSON(`cohorts/${cohort_id}/performances/${user_id}`);
  }
  checkSuccessCriteria(cohort_id, success_criteria_id, checked) {
    return postJSON(`evidence`, {cohort_id, success_criteria_id, checked});
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
