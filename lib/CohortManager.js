const crypto = require('crypto');
const monk = require('monk');

const {fetchJSON, getAuthHeader} = require('./fetchHelpers');
const {getStudentInfo, getInstructorInfo} = require('./learnScraper');
const {learnURL} = require('./constants');
const {Cohort, Student, Instructor} = require('../models');

class CohortManager {
  constructor() {
    this.cache = {};
    this.fetching = {};
    this.waiting = {};
  }

  getCohorts(github_id) {
    return Cohort.findByGithubId(github_id);
  }

  getCohort(cohort_id) {
    return this.getFromCache(cohort_id)
      .then(cohort => {
        const temp = Object.assign({}, cohort);
        delete temp.standards;
        return temp;
      });
  }

  getStandards(cohort_id) {
    return this.getPropertyFromCache(cohort_id, 'standards');
  }

  getStandard(cohort_id, standard_id) {
    return this.getPropertyFromCache(cohort_id, 'standards')
      .then(standards => {
        return standards[standard_id];
      });
  }

  getSubjects(cohort_id) {
    return this.getPropertyFromCache(cohort_id, 'subjects');
  }

  getSubject(cohort_id, name) {
    return this.getPropertyFromCache(cohort_id, 'subjects')
      .then(subjects => {
        return subjects[name];
      });
  }

  getStudents(cohort_id) {
    return this
      .getPropertyFromCache(cohort_id, 'students')
      .then((ids) => Student.findByIds(ids));
  }

  getInstructors(cohort_id) {
    return this
      .getPropertyFromCache(cohort_id, 'instructors')
      .then((ids) => Instructor.findByIds(ids));
  }

  getPropertyFromCache(cohort_id, property) {
    return this.getFromCache(cohort_id)
      .then(data => {
        return data[property];
      });
  }

  getFromCache(cohort_id) {
    if(this.cache[cohort_id]) {
      return Promise.resolve(this.cache[cohort_id]);
    } else {
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
              this.cache[cohort_id] = cohort[0];
              this.resolveWaiting(cohort_id, cohort[0]);
            } else {
              return fetchCohortData(cohort_id)
                .then(data => {
                  this.cache[cohort_id] = data;
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
  }

  clearWaiting(action, cohort_id, data) {
    this.waiting[cohort_id].forEach(promise => {
      promise[action](data);
    });
    this.waiting[cohort_id] = [];
  }

  resolveWaiting(cohort_id, data) {
    this.clearWaiting('resolve', cohort_id, data);
  }

  rejectWaiting(cohort_id, error) {
    this.clearWaiting('reject', cohort_id, error);
  }
}

function fetchCohortData(cohort_id) {
  return fetchJSON(`${learnURL}api/v1/cohorts/${cohort_id}/performances`, getAuthHeader())
    .then(data => {
      if(data.error) throw data.error;
      data.cohort_id = cohort_id;
      return formatCohortData(data)
        .then(() => Promise.all([
          Student.upsert(data.students),
          Instructor.upsert(data.instructors)
        ])).then(results => {
          data.students = results[0].map(student => student.github_id);
          data.instructors = results[1].map(instructor => instructor.github_id);
          return Cohort
            .insert(data);
        });
    });
}

function formatCohortData(data) {
  if(data.subjects) {
    data.standards = {};
    data.subjects = data.subjects.reduce((subjects, subject) => {
      subject._id = monk.id();
      subjects[subject.name] = subject;
      const regexp = new RegExp('\<li\>(.*)\<\/li\>', 'g');
      subject.standards = subject.standards.reduce((standards, standard) => {
        standard._id = monk.id();
        standards[standard.id] = standard;
        data.standards[standard.id] = standard;
        if(standard.success_criteria) {
          const success_criteria = [];
          let order = 0;
          let match = regexp.exec(standard.success_criteria);
          while (match != null) {
            const text = match[1];
            if(text) {
              const hash = crypto.createHash('md5');
              hash.update(text);
              success_criteria.push({
                _id: `${standard.id}-${order}-${hash.digest('hex')}`,
                order,
                text
              });
              order++;
            }
            match = regexp.exec(standard.success_criteria);
          }
          standard.success_criteria = success_criteria;
        }
        delete standard.edit_standard_path;

        return standards;
      }, {});
      return subjects;
    }, {});
  }

  delete data.performances;

  return Promise.all([
    getStudentInfo(data.cohort_id)
      .then(students => {
        data.students.forEach(student => {
          student.github_id = students[student.full_name].github_id;
          delete student.performance_path;
          delete student.view_performance;
        });
      }),
    getInstructorInfo(data.cohort_id)
      .then(instructors => {
        data.instructors = instructors;
      })
  ]);
}

module.exports = new CohortManager();
