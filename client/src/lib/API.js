import fetch from 'isomorphic-fetch';

const API_URL = window.location.host.indexOf('localhost') > -1 ? 'http://localhost:3000/api/v1/' : 'production';

function fetchJSON(endpoint) {
  return fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${localStorage.token}`
    }
  }).then(response => {
    return response.json();
  })
}

function postJSON(endpoint, body) {
  return fetchWithBody('POST', endpoint, body);
}

function deleteJSON(endpoint, body) {
  return fetchWithBody('DELETE', endpoint, body);
}

function fetchWithBody(method, endpoint, body) {
  return fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(response => {
    return response.json();
  });
}

class API {
  getCohorts() {
    return fetchJSON('cohorts');
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
  checkSuccessCriteria(cohort_id, success_criteria_id, checked) {
    return postJSON(`evidence`, {cohort_id, success_criteria_id, checked});
  }
  assignStandard(cohort_id, standard_id) {
    return postJSON(`cohorts/${cohort_id}/standards/${standard_id}/assign`, {assign: true});
  }
  addStandardTag(cohort_id, standard_id, tagName, value) {
    return postJSON(`cohorts/${cohort_id}/standards/${standard_id}/tag`, { tagName, value });
  }
  removeStandardTag(cohort_id, standard_id, tagName, value) {
    return deleteJSON(`cohorts/${cohort_id}/standards/${standard_id}/tag`, { tagName, value });
  }
}

export default new API();
