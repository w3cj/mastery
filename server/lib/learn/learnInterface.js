const crypto = require('crypto');
const monk = require('monk');
const NodeCache = require( "node-cache" );
const learnCache = new NodeCache();

require('dotenv').config();

const {postJSON, fetchJSON, getAuthHeader} = require('../fetchHelpers');
const {Student, Instructor} = require('../../models');
const {learnURL} = require('../constants');
const {averagePerformances, averageStudentPerformances} = require('./analytics');
const queries = require('../../db/queries');

function getAllCohorts() {
  return queries.getAllCohorts();
}

function getStudentImages(cohort_id) {
  return queries
    .getStudents(cohort_id)
    .then(students => {
      return students.map(({id, image, full_name}) => {
        return {
          id,
          full_name,
          img: image
        }
      });
    });
}

function getStudentInfo(cohort_id) {
  return queries
    .getStudents(cohort_id)
    .then(students => {
      return students.reduce((all, {github_username, github_id, full_name}) => {
        const student = {
          github_id,
          github_username,
          full_name
        };
        all[student.full_name] = student;
        return all;
      }, {});
    });
}

function getInstructorInfo(cohort_id) {
  return queries.getInstructors(cohort_id);
}

function getLearnUser(id) {
  return queries.getUserWithCohorts(id);
}

function getLearnUserByEmail(email) {
  return queries.getUserByEmail(email);
}

function getPerformances(cohort_id) {
  return fetchJSON(`${learnURL}api/v1/cohorts/${cohort_id}/performances`, getAuthHeader())
    .then(performances => {
      performances.average = averagePerformances(performances);
      return performances;
    });
}

function getAverageStudentPerformances(cohort_id, user_id) {
  return queries.getUserPerformances(cohort_id, user_id)
    .then(performances => {
      const scores = Object.keys(performances).reduce((all, performance_id) => {
        const performance = performances[performance_id];
        if(performance.standard_type == 'core') {
          all.core[performance.standard_id] = performance.score;
        } else {
          all.elective[performance.standard_id] = performance.score;
        }
        return all;
      }, {
        core: {},
        elective: {}
      });

      return averageStudentPerformances(scores);
    });
}

function getUserPerformances(cohort_id, user_id) {
  return queries
    .getUserPerformances(cohort_id, user_id)
    .then(performances => {
      return Object
        .keys(performances)
        .reduce((all, performance_id) => {
          all[performance_id] = performances[performance_id].score;
          return all;
        }, {});
    });
}

function setUserPerformance(cohort_id, user_id, standard_id, score) {
  const options = getAuthHeader();
  options.body = JSON.stringify(options.body)

  return postJSON(`${learnURL}api/v1/cohorts/${cohort_id}/users/${user_id}/performances`, options, {
    performance: {
      score,
      standard_ids: [standard_id]
    }
  });
}

function fetchCohortInfo(cohort_id) {
  return queries
    .getCohort(cohort_id)
    .then(({name, label, curriculum_id}) => {
      return {
        cohort_id,
        name,
        label,
        curriculum_id
      }
    });
}

function fetchCohortData(cohort_id) {
  return Promise.all([
    fetchCohortInfo(cohort_id),
    getPerformances(cohort_id)
  ]).then(results => {
      const data = results[0];
      const performanceData = results[1];
      if(data.error) throw data.error;
      data.subjects = performanceData.subjects;
      data.students = performanceData.students;
      return formatCohortData(data)
        .then(() => Promise.all([
          Student.upsert(data.students),
          Instructor.upsert(data.instructors)
        ])).then(results => {
          data.students = results[0].map(student => student.github_id);
          data.instructors = results[1].map(instructor => instructor.github_id);
          return data;
        });
    });
}

function formatCohortData(data) {
  if(data.subjects) {
    formatSubjects(data);
  }

  return Promise.all([
    getStudentInfo(data.cohort_id)
      .then(students => {
        data.students.forEach(student => {
          student.github_id = students[student.full_name].github_id;
        });
      }),
    getInstructorInfo(data.cohort_id)
      .then(instructors => {
        data.instructors = instructors;
      })
  ]);
}

function formatSubjects(data){
  data.standards = {};
  data.subjects.forEach(subject => {
    subject.standards.forEach((standard, i) => {
      standard.order = i;
      formatStandard(standard);
      data.standards[standard.id] = standard;
    });
    delete subject.standards;
  });
}

function formatStandard(standard) {
  standard._id = monk.id();
  if(standard.success_criteria) {
    standard.success_criteria = parseSuccessCriteria(standard.id, standard.success_criteria);
  }
  delete standard.edit_standard_path;
}

const regexp = new RegExp('\<li\>(.*)\<\/li\>', 'g');
function parseSuccessCriteria(standard_id, success_criteria_text) {
  const success_criteria = [];
  let order = 0;
  let match = regexp.exec(success_criteria_text);
  while (match != null) {
    const text = match[1];
    if(text) {
      const hash = crypto.createHash('md5');
      hash.update(text);
      success_criteria.push({
        _id: `${standard_id}-${order}-${hash.digest('hex')}`,
        order,
        text
      });
      order++;
    }
    match = regexp.exec(success_criteria_text);
  }
  return success_criteria;
}

function cacheify(fn, ttl) {
  const original = fn;
  const name = fn.toString().split('function ')[1].split('(')[0];
  function cacheified() {
    const cacheKey = `${name}-${Array.prototype.join.call(arguments, ',')}`;
    return new Promise((resolve, reject) => {
      learnCache.get(cacheKey, (err, value) => {
        if(!err) {
          if(value == undefined){
            return original.apply(this, arguments)
              .then(data => {
                resolve(new Promise((resolve, reject) => {
                  learnCache.set(cacheKey, data, ttl, (err, success) => {
                    if(!err && success) {
                      console.log('Set cache:', name, cacheKey);
                      resolve(data);
                    } else {
                      console.log('Error setting cache:', name, cacheKey);
                      reject(err);
                    }
                  });
                }));
              });
          } else {
            console.log('Serving from cache:', name, cacheKey);
            resolve(value);
          }
        } else {
          reject(err);
        }
      });
    });
  }

  return cacheified;
}

/* eslint-disable */
getLearnUser = cacheify(getLearnUser, 86400);
getAllCohorts = cacheify(getAllCohorts, 86400);
fetchCohortData = cacheify(fetchCohortData, 86400);
fetchCohortInfo = cacheify(fetchCohortInfo, 86400);
getStudentImages = cacheify(getStudentImages, 3600);
/* eslint-enable */

module.exports = {
  getAllCohorts,
  getPerformances,
  getAverageStudentPerformances,
  getUserPerformances,
  setUserPerformance,
  fetchCohortData,
  fetchCohortInfo,
  getLearnUser,
  getLearnUserByEmail,
  getStudentImages,
  getStudentInfo,
  getInstructorInfo
};
