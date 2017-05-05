const cheerio = require('cheerio');
const crypto = require('crypto');
const monk = require('monk');
const NodeCache = require( "node-cache" );
const learnCache = new NodeCache();

require('dotenv').config();

const {postJSON, fetchJSON, fetchText, getAuthHeader} = require('../fetchHelpers');
const {Student, Instructor} = require('../../models');
const {learnURL} = require('../constants');
const {averagePerformances, averageStudentPerformances} = require('./analytics');

function getAllCohorts() {
  return fetchJSON(`${learnURL}api/v1/cohorts`, getAuthHeader());
}

function getStudentImages(cohort_id) {
  const studentURL = `${learnURL}cohorts/${cohort_id}/students?layout=grid`;
  return fetchText(studentURL, getAuthHeader())
    .then(getStudentImagesFromBody);
}

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

function getStudentImagesFromBody(body) {
  const $ = cheerio.load(body);
  const thumbnails = $('a.thumbnail');

  const images = [];

  thumbnails.each(function() {
    const thumbnail = $(this);
    const id = thumbnail.attr('href').split('/students/')[1];
    const img = thumbnail.find('img').attr('src');
    const full_name = thumbnail.find('.caption').text().trim();

    images.push({
      id,
      img,
      full_name
    });
  });

  return images;
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

function getLearnUserByEmail(email) {
  const searchURL = `${learnURL}users?q=${email}`;
  return fetchText(searchURL, getAuthHeader())
    .then(body => {
      const $ = cheerio.load(body);
      const id = $($('div.container table td a')[0]).attr('href').split('/users/')[1];
      return id;
    }).then(getLearnUser);
}

function getUserFromBody(body) {
  const $ = cheerio.load(body);
  const full_name = $($('div.page-header h1')[0]).text().replace('(active)', '').trim();
  const github_username = $($('dl.dl-horizontal dd')[1]).text();
  const image = $($('div.col-md-3 img')[0]).attr('src');
  const cohorts = [];

  $('div.container ul li a[href*="/cohorts/"]').each(function() {
    const cohort_id = $(this).attr('href').replace('/dashboard', '').split('/cohorts/')[1];
    cohorts.push(cohort_id);
  });

  const admin = $($('dd')[2]).text() == 'admin';

  const user = {
    full_name,
    image,
    cohorts,
    admin
  };

  if(github_username) {
    return getGithubUser(github_username)
      .then(githubUser => {
        user.github_id = githubUser.id;
        return user;
      });
  } else {
    return Promise.resolve(user);
  }
}

function getPerformances(cohort_id) {
  return fetchJSON(`${learnURL}api/v1/cohorts/${cohort_id}/performances`, getAuthHeader());
}

function getAveragePerformances(cohort_id) {
  console.log('fuck your mother');
  return fetchJSON(`${learnURL}api/v1/cohorts/${cohort_id}/performances`, getAuthHeader())
    .then(performances => {
      return averagePerformances(performances);
    });
}

function getAverageStudentPerformances(cohort_id, user_id) {
  return fetchJSON(`${learnURL}cohorts/${cohort_id}/users/${user_id}/performances.json`, getAuthHeader())
    .then(data => {
      const scores = data.standards.reduce((performances, standard) => {
        standard.performances.forEach(s => {
          if(s.standard_type == 'core') {
            performances['core'][s.id] = s.score
          } else {
            performances['elective'][s.id] = s.score
          }
        });
        return performances;
      }, {
        core: {},
        elective: {}
      });

      return averageStudentPerformances(scores);
    });
}

function getUserPerformances(cohort_id, user_id) {
  return fetchJSON(`${learnURL}cohorts/${cohort_id}/users/${user_id}/performances.json`, getAuthHeader())
    .then(data => {
      return data.standards.reduce((performances, standard) => {
        standard.performances.forEach(s => performances[s.id] = s.score);
        return performances;
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
  return fetchJSON(`${learnURL}api/v1/cohorts/${cohort_id}`, getAuthHeader())
          .then(json => {
            const cohort_info = {
              cohort_id,
              name: json.data.attributes.name,
              label: json.data.attributes.label
            };

            return cohort_info;
          });
}

function fetchCohortData(cohort_id) {
  return Promise.all([
    fetchJSON(`${learnURL}api/v1/cohorts/${cohort_id}/performances`, getAuthHeader()),
    fetchCohortInfo(cohort_id),
  ]).then(results => {
      const data = results[0];
      const cohort_info = results[1];
      if(data.error) throw data.error;
      data.cohort_id = cohort_id;
      data.name = cohort_info.name;
      data.label = cohort_info.label;
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
  getAveragePerformances,
  getAverageStudentPerformances,
  getUserPerformances,
  setUserPerformance,
  fetchCohortData,
  fetchCohortInfo,
  getLearnUser,
  getLearnUserByEmail,
  getStudentsFromBody,
  getStudentImages,
  getStudentInfo,
  getInstructorsFromBody,
  getInstructorInfo
};
