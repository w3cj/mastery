require('dotenv').load();

const db = require('monk')(process.env.MONGO_URI);
db.options = {
  castIds : false
};

const User = require('./User');
const Cohort = require('./Cohort');
const Student = require('./Student');
const Instructor = require('./Instructor');

function deleteAll() {
  db.get('users').remove({});
  db.get('cohorts').remove({});
  db.get('students').remove({});
  db.get('instructors').remove({});
}

module.exports = {
  deleteAll,
  User: new User(db),
  Cohort: new Cohort(db),
  Student: new Student(db),
  Instructor: new Instructor(db)
};
