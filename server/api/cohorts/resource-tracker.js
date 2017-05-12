const express = require('express');

const { processRequest, authorize } = require('../../lib/routeHelpers');
const { ResourceTracker } = require('../../models');

const routes = {
  '/': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(ResourceTracker.getAllCohort(cohort_id), res, next);
  },
  '/student/:student_id': (req, res, next) => {
    const {cohort_id, student_id} = req.params;
    processRequest(ResourceTracker.getAllStudent(cohort_id, student_id), res, next);
  }
};

const router = express.Router({mergeParams: true});

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

router.post('/student/:student_id/resource/:resource_id/check', authorize, (req, res, next) => {
  const { cohort_id, student_id, resource_id } = req.params;
  processRequest(ResourceTracker.done(cohort_id, student_id, resource_id, true), res, next);
});

router.post('/student/:student_id/resource/:resource_id/uncheck', authorize, (req, res, next) => {
  const { cohort_id, student_id, resource_id } = req.params;
  processRequest(ResourceTracker.done(cohort_id, student_id, resource_id, false), res, next);
});

router.post('/student/:student_id/resource/:resource_id/checkout', authorize, (req, res, next) => {
  const { cohort_id, student_id, resource_id } = req.params;
  processRequest(ResourceTracker.checkout(cohort_id, student_id, resource_id, true), res, next);
});

module.exports = router;
