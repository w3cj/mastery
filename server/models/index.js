require('dotenv').load();

const db = require('monk')(process.env.MONGO_URI);
db.options = {
  castIds : false
};

const User = require('./User');
const Student = require('./Student');
const Instructor = require('./Instructor');
const Evidence = require('./Evidence');
const Resource = require('./Resource');
const StandardCollection = require('./StandardCollection');

function deleteAll() {
  db.get('users').remove({});
  db.get('students').remove({});
  db.get('instructors').remove({});
  db.get('evidences').remove({});
  db.get('resources').remove({});
}

// deleteAll();

module.exports = {
  deleteAll,
  User: new User(db),
  Student: new Student(db),
  Instructor: new Instructor(db),
  Evidence: new Evidence(db),
  Resource: new Resource(db),
  StandardCollection: new StandardCollection(db)
};
