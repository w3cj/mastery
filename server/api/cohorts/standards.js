const express = require('express');

const { processRequest, isInstructor } = require('../../lib/routeHelpers');
const CohortManager = require('../../lib/CohortManager');
const { Resource, StandardCollection, SuccessCriteria } = require('../../models');

const routes = {
  '/': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(CohortManager.getStandards(cohort_id), res, next);
  },
  '/collections': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(StandardCollection.getAll(cohort_id), res, next);
  },
  '/resources': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(Resource.getAll(cohort_id), res, next);
  },
  '/:standard_id': (req, res, next) => {
    const {cohort_id, standard_id} = req.params;
    processRequest(CohortManager.getStandard(cohort_id, standard_id), res, next);
  },
  '/:standard_id/resources': (req, res, next) => {
    const {cohort_id, standard_id} = req.params;
    processRequest(Resource.find(cohort_id, standard_id), res, next);
  },
};

const router = express.Router({mergeParams: true});

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

router.post('/:standard_id/disable/:success_criteria_id', isInstructor, (req, res, next) => {
  const {cohort_id, standard_id, success_criteria_id} = req.params;
  processRequest(SuccessCriteria.disable(cohort_id, standard_id, success_criteria_id), res, next);
});

router.post('/:standard_id/enable/:success_criteria_id', isInstructor, (req, res, next) => {
  const {cohort_id, standard_id, success_criteria_id} = req.params;
  processRequest(SuccessCriteria.enable(cohort_id, standard_id, success_criteria_id), res, next);
});

router.get('/collections/:collection_name', (req, res, next) => {
  const {cohort_id, collection_name} = req.params;
  processRequest(StandardCollection.find(cohort_id, collection_name), res, next);
});

router.post('/collections/:collection_name/:standard_id', isInstructor, (req, res, next) => {
  const {cohort_id, collection_name, standard_id} = req.params;
  processRequest(StandardCollection.addStandard(cohort_id, collection_name, standard_id), res, next);
});

router.delete('/collections/:collection_name/:standard_id', isInstructor, (req, res, next) => {
  const {cohort_id, collection_name, standard_id} = req.params;
  processRequest(StandardCollection.removeStandard(cohort_id, collection_name, standard_id), res, next);
});

router.post('/:standard_id/resources', isInstructor, (req, res, next) => {
  const resource = req.body;
  const {cohort_id, standard_id} = req.params;
  if(resource.title && resource.type && resource.url && resource.description) {
    resource.cohort_id = cohort_id;
    resource.standard_id = standard_id;
    processRequest(Resource.insert(resource), res, next);
  } else {
    next(new Error('Missing required parameters.'));
  }
});

module.exports = router;
