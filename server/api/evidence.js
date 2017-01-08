const ezc = require('express-zero-config');

const {resJSON, nextError} = require('../lib/routeHelpers');
const {Evidence} = require('../models');

function processRequest(promise, res, next) {
  promise
    .then(resJSON(res))
    .catch(nextError(next));
}

const routes = {
  '/': (req, res, next) => {
    processRequest(Evidence.find(req.user.github_id), res, next);
  }
};

const router = ezc.createRouter();

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

router.post('/', (req, res, next) => {
  const {cohort_id, success_criteria_id, checked} = req.body;
  processRequest(Evidence.update(req.user.github_id, cohort_id, success_criteria_id, checked), res, next);
});

module.exports = router;
