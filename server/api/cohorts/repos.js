const express = require('express');

const { resJSON, nextError, isInstructor } = require('../../lib/routeHelpers');
const CohortManager = require('../../lib/CohortManager');
const { Repo } = require('../../models');

function processRequest(promise, res, next) {
  promise
    .then(resJSON(res))
    .catch(nextError(next));
}

const github = require('../../lib/github');

const routes = {
  '/': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(Repo.getAll(cohort_id), res, next);
  },
  '/:name': (req, res, next) => {
    const {cohort_id, name} = req.params;
    processRequest(Promise.all([
      CohortManager.getStudents(cohort_id),
      github.getAllPullRequests(name),
      github.getAllForks(name)
    ]).then(({0: students, 1: pulls, 2: forks}) => {
      return students.reduce((all, student) => {
        all[student.id] = pulls[student.github_id] || {};
        all[student.id].forked = forks[student.github_id] ? true : false;
        return all;
      }, {});
    }), res, next);
  }
};

const router = express.Router({mergeParams: true});

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

router.post('/:name', isInstructor, (req, res, next) => {
  const { cohort_id, name } = req.params;
  processRequest(Repo.insert(cohort_id, name), res, next);
});

module.exports = router;
