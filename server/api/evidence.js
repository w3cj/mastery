const ezc = require('express-zero-config');

const {resJSON, nextError} = require('../lib/routeHelpers');
const {Evidence, Student, Instructor} = require('../models');

function processRequest(promise, res, next) {
  promise
    .then(resJSON(res))
    .catch(nextError(next));
}

function authorize(req, res, next) {
  const {user_id} = req.params;
  if(req.user.isInstructor || req.user.learn_id == user_id) {
    next();
  } else {
    next(new Error('Un-Authorized'));
  }
}

const router = ezc.createRouter();

router.get('/', (req, res, next) => {
  processRequest(Evidence.find(req.user.github_id), res, next);
});

function findUser(user_id) {
  return Promise.all([
    Instructor.findById(user_id),
    Student.findById(user_id),
  ]).then(results => {
    const instructor = results[0];
    const student = results[1];
    const user = (instructor ? instructor : student);
    return user;
  });
}

router.get('/:user_id', authorize, (req, res, next) => {
  const {user_id} = req.params;
  processRequest(
    findUser(user_id).then(user => {
      return Evidence.find(user.github_id);
    }), res, next);
});

router.post('/', (req, res, next) => {
  const {cohort_id, success_criteria_id, checked} = req.body;
  processRequest(Evidence.update(req.user.github_id, cohort_id, success_criteria_id, checked), res, next);
});

router.post('/:user_id', authorize, (req, res, next) => {
  const {cohort_id, success_criteria_id, checked} = req.body;
  const {user_id} = req.params;
  processRequest(
    findUser(user_id)
      .then(user => {
        return Evidence.update(user.github_id, cohort_id, success_criteria_id, checked);
      }), res, next);
});

module.exports = router;
