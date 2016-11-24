const cheerio = require('cheerio');

require('dotenv').config();

const {fetchJSON, fetchText, getAuthHeader} = require('./fetchHelpers');
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

module.exports = {
  getLearnUser,
  getStudentsFromBody,
  getStudentInfo,
  getInstructorsFromBody,
  getInstructorInfo
};
