require('dotenv').load();

const db = require('monk')(process.env.MONGO_URI);
db.options = {
  castIds : false
};

const User = require('./User');
const Student = require('./Student');
const Instructor = require('./Instructor');
const Performance = require('./Performance');
const Evidence = require('./Evidence');
const Resource = require('./Resource');
const Note = require('./Note');
const Repo = require('./Repo');
const StandardCollection = require('./StandardCollection');
const SuccessCriteria = require('./SuccessCriteria');

module.exports = {
  User: new User(db),
  Student: new Student(db),
  Instructor: new Instructor(db),
  Performance: new Performance(db),
  Evidence: new Evidence(db),
  Resource: new Resource(db),
  Note: new Note(db),
  Repo: new Repo(db),
  StandardCollection: new StandardCollection(db),
  SuccessCriteria: new SuccessCriteria(db)
};
