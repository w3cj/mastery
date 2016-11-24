const ezc = require('express-zero-config');

const {resJSON, nextError} = require('../lib/routeHelpers');
const CohortManager = require('../lib/CohortManager');

function processRequest(promise, res, next) {
  promise
    .then(resJSON(res))
    .catch(nextError(next));
}

const routes = {
  '/': (req, res, next) => {
    processRequest(CohortManager.getCohorts(req.user.github_id), res, next);
  },
  '/:cohort_id': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(CohortManager.getCohort(cohort_id), res, next);
  },
  '/:cohort_id/subjects': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(CohortManager.getSubjects(cohort_id), res, next);
  },
  '/:cohort_id/subjects/:name': (req, res, next) => {
    const {cohort_id, name} = req.params;
    processRequest(CohortManager.getSubject(cohort_id, name), res, next);
  },
  '/:cohort_id/standards': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(CohortManager.getStandards(cohort_id), res, next);
  },
  '/:cohort_id/standards/:standard_id': (req, res, next) => {
    const {cohort_id, standard_id} = req.params;
    processRequest(CohortManager.getStandard(cohort_id, standard_id), res, next);
  },
  '/:cohort_id/students': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(CohortManager.getStudents(cohort_id), res, next);
  },
  '/:cohort_id/instructors': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(CohortManager.getInstructors(cohort_id), res, next);
  }
};

const router = ezc.createRouter();

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

module.exports = router;
