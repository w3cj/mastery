import {
  fetchJSON,
  postJSON,
  deleteJSON
} from './fetch';
import {setCohortBadge} from './utils';

class API {
  constructor() {
    this.cache = {};
    this.waitingCache = {};
    this.waitingNotes = {};
    this.cacheify('getUser');
    this.cacheify('getCohorts');
    this.cacheify('getCohort');
    this.cacheify('getStudent');
    this.cacheify('getStudents');
    this.cacheify('getStudentImages');
    this.cacheify('getAllCohorts');
    this.cacheify('getDisabledSuccessCriteria');
  }
  cacheify(name) {
    const original = this[name];
    this[name] = (function () {
      const cacheName = `${name}-${Array.prototype.join.call(arguments, ',')}`;
      if(this.cache[cacheName]) {
        return Promise.resolve(this.cache[cacheName]);
      } else if (this.waitingCache[cacheName]) {
        return new Promise(resolve => {
          this.waitingCache[cacheName].push({resolve});
        });
      } else {
        this.waitingCache[cacheName] = [];
        return original.apply(this, arguments)
          .then(data => {
            this.cache[cacheName] = data;
            this.waitingCache[cacheName].forEach(w => w.resolve(data));
            this.waitingCache[cacheName] = null;
            return data;
          });
      }
    }).bind(this);
  }
  getExchange() {
    return fetchJSON('auth/exchange');
  }
  getAllCohorts() {
    return fetchJSON('learn/cohorts/all');
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
        setCohortBadge(cohort);
        return cohort;
      });
  }
  getCohortEvidences(cohort_id) {
    return fetchJSON(`evidence/cohort/${cohort_id}`);
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
  getUser(user_id) {
    return fetchJSON(`learn/users/${user_id}`);
  }
  getPerformances(cohort_id) {
    return fetchJSON(`learn/cohorts/${cohort_id}/performances`);
  }
  getAveragePerformances(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/performances/average`);
  }
  getAverageStudentPerformances(cohort_id, user_id) {
    return fetchJSON(`cohorts/${cohort_id}/performances/${user_id}/average`);
  }
  getStudentPerformances(cohort_id, user_id) {
    return fetchJSON(`cohorts/${cohort_id}/performances/${user_id}`);
  }
  setPerformance(cohort_id, student_id, standard_id, score) {
    return postJSON(`cohorts/${cohort_id}/students/${student_id}/performances/${standard_id}`, {score});
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
  getStandardCollections(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/standards/collections`);
  }
  getStandardCollection(cohort_id, collection_name) {
    return fetchJSON(`cohorts/${cohort_id}/standards/collections/${collection_name}`);
  }
  addStandardToCollection(cohort_id, collection_name, standard_id) {
    return postJSON(`cohorts/${cohort_id}/standards/collections/${collection_name}/${standard_id}`);
  }
  removeStandardFromCollection(cohort_id, collection_name, standard_id) {
    return deleteJSON(`cohorts/${cohort_id}/standards/collections/${collection_name}/${standard_id}`);
  }
  getAllResources(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/standards/resources`).then(resources => {
      return resources.reduce((byId, standard) => {
        byId[standard._id] = standard.resources;
        return byId;
      }, {});
    });
  }
  addResource(cohort_id, standard_id, resource) {
    return postJSON(`cohorts/${cohort_id}/standards/${standard_id}/resources`, resource);
  }
  approveSuccessCriteria(user_id, cohort_id, success_criteria_id, approved) {
    return postJSON(`evidence/${user_id}/success_criteria/${success_criteria_id}/approve`, {
      cohort_id,
      approved
    });
  }
  getCohortNotes(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/notes`);
  }
  getStudentNotes(cohort_id, student_id) {
    return fetchJSON(`cohorts/${cohort_id}/students/${student_id}/notes`);
  }
  getUnreadCohortNotes(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/notes/unread`);
  }
  getUnreadStudentNotes(cohort_id, student_id) {
    return fetchJSON(`cohorts/${cohort_id}/students/${student_id}/notes/unread`);
  }
  getNotes(cohort_id, student_id, standard_id) {
    if(this.waitingNotes[cohort_id+student_id]) {
      return new Promise(resolve => {
        this.waitingNotes[cohort_id+student_id].push({resolve, standard_id});
      });
    } else {
      this.waitingNotes[cohort_id+student_id] = [];
      return fetchJSON(`cohorts/${cohort_id}/students/${student_id}/notes`)
        .then(notes => {
          notes = notes.reduce((notes, note) => {
            notes[note.standard_id] = notes[note.standard_id] || [];
            notes[note.standard_id].push(note);
            return notes;
          }, {});

          notes[standard_id] = notes[standard_id] || [];

          this.waitingNotes[cohort_id+student_id].forEach(waiting => {
            waiting.resolve(notes[waiting.standard_id] || []);
          });
          this.waitingNotes[cohort_id+student_id] = null;

          return notes[standard_id];
        });
    }
  }
  addNote(cohort_id, student_id, newNote) {
    return postJSON(`cohorts/${cohort_id}/students/${student_id}/notes`, newNote);
  }
  markNoteAsRead(cohort_id, student_id, note_id) {
    return postJSON(`cohorts/${cohort_id}/students/${student_id}/notes/${note_id}/read`);
  }
  deleteNote(cohort_id, student_id, note_id) {
    return deleteJSON(`cohorts/${cohort_id}/students/${student_id}/notes/${note_id}`);
  }
  getDisabledSuccessCriteria(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/disabledSuccessCriteria`);
  }
  disableSuccessCriteria(cohort_id, standard_id, success_criteria_id) {
    return postJSON(`cohorts/${cohort_id}/standards/${standard_id}/disable/${success_criteria_id}`);
  }
  enableSuccessCriteria(cohort_id, standard_id, success_criteria_id) {
    return postJSON(`cohorts/${cohort_id}/standards/${standard_id}/enable/${success_criteria_id}`);
  }
  getStudentResourceTrackers(cohort_id, student_id) {
    return fetchJSON(`cohorts/${cohort_id}/resource-tracker/student/${student_id}`)
      .then(resourceTrackers => {
        if (!resourceTrackers) return {};
        return resourceTrackers.reduce((all, one) => {
          all[one.resource_id] = one;
          return all;
        }, {});
      });
  }
  checkResource(cohort_id, student_id, resource_id) {
    return postJSON(`cohorts/${cohort_id}/resource-tracker/student/${student_id}/resource/${resource_id}/check`);
  }
  uncheckResource(cohort_id, student_id, resource_id) {
    return postJSON(`cohorts/${cohort_id}/resource-tracker/student/${student_id}/resource/${resource_id}/uncheck`);
  }
  checkoutResource(cohort_id, student_id, resource_id) {
    return postJSON(`cohorts/${cohort_id}/resource-tracker/student/${student_id}/resource/${resource_id}/checkout`);
  }
  getRepos(cohort_id) {
    return fetchJSON(`cohorts/${cohort_id}/repos`);
  }
  getRepo(cohort_id, name) {
    return fetchJSON(`cohorts/${cohort_id}/repos/${name}`);
  }
  addRepo(cohort_id, name) {
    return postJSON(`cohorts/${cohort_id}/repos/${name}`);
  }
}

export default new API();
