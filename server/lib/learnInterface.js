const cheerio = require('cheerio');
const crypto = require('crypto');
const monk = require('monk');

require('dotenv').config();

const {fetchJSON, fetchText, getAuthHeader} = require('./fetchHelpers');
const {Student, Instructor} = require('../models');
const {learnURL} = require('./constants');

function getStudentInfo(cohort_id) {
  const studentURL = `${learnURL}cohorts/${cohort_id}/students`;

  return fetchText(studentURL, getAuthHeader())
    .then(getStudentsFromBody)
    .then(students => {
      return Object.keys(students)
        .reduce((promise, full_name) => {
          const student = students[full_name];
          return promise.then(() => {
            return getGithubUser(student.github_username)
              .then(user => {
                student.github_id = user.id;
              });
          });
        }, Promise.resolve())
        .then(() => {
          return students;
        });
    });
}

function getInstructorInfo(cohort_id) {
  const staffingURL = `${learnURL}cohorts/${cohort_id}/staffings`;

  return fetchText(staffingURL, getAuthHeader())
    .then(getInstructorsFromBody);
}

function getStudentsFromBody(body) {
  const $ = cheerio.load(body);

  const rows = $('table.table tbody tr');

  const studentsByName = {};

  rows.each(function() {
    const columns = $(this).find('td');
    const student = {
      full_name: $(columns[0]).text(),
      github_username: $(columns[3]).text().toLowerCase()
    };

    studentsByName[student.full_name] = student;
  });

  return studentsByName;
}

function getInstructorsFromBody(body) {
  const $ = cheerio.load(body);

  const rows = $('table.table tbody tr');
  const instructor_ids = [];

  rows.each(function() {
    const columns = $(this).find('td');
    const id = $(columns[0].children[0]).attr('href').split('/users/')[1];
    instructor_ids.push(isNaN(id) ? id : Number(id));
  });

  return Promise.all(instructor_ids.map(getLearnUser));
}

function getGithubUser(github_username) {
  return fetchJSON(`https://api.github.com/users/${github_username}?access_token=${process.env.GITHUB_TOKEN}`)
    .then(user => {
      if(user.id) {
        user.id = user.id.toString();
      }
      return user;
    });
}

function getLearnUser(id) {
  const userURL = `${learnURL}users/${id}`;
  return fetchText(userURL, getAuthHeader())
    .then(getUserFromBody)
    .then(user => {
      user.id = id;
      return user;
    });
}

function getUserFromBody(body) {
  const $ = cheerio.load(body);
  const full_name = $('ol.breadcrumb li.active').text();
  const github_username = $($('dl.dl-horizontal dd')[1]).text();
  if(github_username) {
    return getGithubUser(github_username)
      .then(githubUser => {
        return {
          full_name,
          github_id: githubUser.id
        };
      });
  } else {
    return Promise.resolve({
      full_name
    });
  }
}

function fetchPerformances(cohort_id, user_id) {
  return fetchJSON(`${learnURL}cohorts/${cohort_id}/users/${user_id}/performances.json`, getAuthHeader())
    .then(data => {
      return data.standards.reduce((performances, standard) => {
        standard.performances.forEach(s => performances[s.id] = s.score);
        return performances;
      }, {});
    });
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
          return data;
        });
    });
}

function formatCohortData(data) {
  if(data.subjects) {
    formatSubjects(data);
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

module.exports = {
  fetchPerformances,
  fetchCohortData,
  getLearnUser,
  getStudentsFromBody,
  getStudentInfo,
  getInstructorsFromBody,
  getInstructorInfo
};
