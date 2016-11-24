require('dotenv').load();

const db = require('monk')(process.env.MONGO_URI);
db.options = {
  castIds : false
};

const users = db.get('users');
const cohorts = db.get('cohorts');
const students = db.get('students');
const instructors = db.get('instructors');

users.index('github_id');

cohorts.index('cohort_id');

students.index('id');
students.index('github_id');

instructors.index('id');
instructors.index('github_id');

// cohorts.remove({});
// students.remove({});
// instructors.remove({});

module.exports = {users, cohorts, students, instructors};
