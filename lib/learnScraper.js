const cheerio = require('cheerio');

require('dotenv').config();

const {fetchJSON, fetchText, getAuthHeader} = require('./fetchHelpers');

function getStudentInfo(cohort_id) {
  const studentURL = `https://learn.galvanize.com/cohorts/${cohort_id}/students`;

  return fetchText(studentURL, getAuthHeader())
    .then(body => {
      return getStudentsFromBody(body);
    });
}

function getInstructorInfo(cohort_id) {
  const staffingURL = `https://learn.galvanize.com/cohorts/${cohort_id}/staffings`;

  return fetchText(staffingURL, getAuthHeader())
    .then(body => {
      return getInstructorsFromBody(body);
    });
}

function getStudentsFromBody(body) {
  const $ = cheerio.load(body);

  const rows = $('table.table tbody tr');

  const studentsByName = {};
  const studentsByGithub = {};

  let promises = Promise.resolve([]);

  rows.each(function() {
    const columns = $(this).find('td');
    const student = {
      full_name: $(columns[0]).text(),
      github_username: $(columns[3]).text().toLowerCase()
    };

    studentsByName[student.full_name] = student;
    studentsByGithub[student.github_username] = student;
    promises = promises.then(users => {
      return getGithubUser(student.github_username)
        .then(user => {
          users.push(user);
          return users;
        }).catch(() => {
          return users;
        });
    });
  });

  return promises
    .then(users => {
      users.forEach(user => {
        if(user.login) {
          studentsByGithub[user.login.toLowerCase()].github_id = user.id;
        } else {
          console.error('github user not found', user);
        }
      });
      return studentsByName;
    });
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
  return fetchJSON(`https://api.github.com/users/${github_username}?access_token=${process.env.GITHUB_TOKEN}`);
}

function getLearnUser(id) {
  const userURL = `https://learn.galvanize.com/users/${id}`;
  return fetchText(userURL, getAuthHeader())
    .then(body => {
      return getUserFromBody(body)
        .then(user => {
          user.id = id;
          return user;
        });
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

module.exports = {getStudentInfo, getInstructorInfo};
