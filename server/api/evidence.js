const ezc = require('express-zero-config');

const {resJSON, nextError} = require('../lib/routeHelpers');
const {Evidence, Student, Instructor} = require('../models');
const CohortManager = require('../lib/CohortManager');

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

router.get('/cohort/:cohort_id', authorize, CohortManager.isInstructor, (req, res, next) => {
  const {cohort_id} = req.params;
  processRequest(Evidence.getAll(cohort_id), res, next);
});

router.post('/', (req, res, next) => {
  const {cohort_id, success_criteria_id, checked} = req.body;
  const approver_id = req.user.isInstructor ? req.user.learn_id : null;
  processRequest(Evidence.update(req.user.github_id, cohort_id, success_criteria_id, checked, req.user.isInstructor, approver_id), res, next);
});

router.post('/:user_id', authorize, (req, res, next) => {
  const {cohort_id, success_criteria_id, checked} = req.body;
  const {user_id} = req.params;
  const approver_id = req.user.isInstructor ? req.user.learn_id : null;
  const approved = req.user.isInstructor ? true : undefined;

  processRequest(
    findUser(user_id)
      .then(user => {
        return Evidence.update(user.github_id, cohort_id, success_criteria_id, checked, approver_id, approved);
      }), res, next);
});

router.post('/:user_id/success_criteria/:success_criteria_id/approve', authorize, CohortManager.isInstructor, (req, res, next) => {
  const {cohort_id, approved} = req.body;
  const {user_id, success_criteria_id} = req.params;
  processRequest(
    findUser(user_id)
      .then(user => {
        return Evidence.approve(user.github_id, cohort_id, success_criteria_id, req.user.learn_id, approved);
      }), res, next);
});

module.exports = router;
