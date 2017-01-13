const ezc = require('express-zero-config');

const {resJSON, nextError} = require('../lib/routeHelpers');
const {Evidence, Student} = require('../models');

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

router.get('/:user_id', authorize, (req, res, next) => {
  const {user_id} = req.params;
  processRequest(
    Student.findById(user_id)
      .then(student => {
        return Evidence.find(student.github_id);
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
    Student.findById(user_id)
      .then(student => {
        return Evidence.update(student.github_id, cohort_id, success_criteria_id, checked);
      }), res, next);
});

module.exports = router;
