const ezc = require('express-zero-config');

const {resJSON, nextError} = require('../lib/routeHelpers');
const CohortManager = require('../lib/CohortManager');
const {Student, StandardCollection, Resource} = require('../models');

function processRequest(promise, res, next) {
  promise
    .then(resJSON(res))
    .catch(nextError(next));
}

const routes = {
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
  '/:cohort_id/standards/collections': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(StandardCollection.getAll(cohort_id), res, next);
  },
  '/:cohort_id/standards/resources': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(Resource.getAll(cohort_id), res, next);
  },
  '/:cohort_id/standards/:standard_id': (req, res, next) => {
    const {cohort_id, standard_id} = req.params;
    processRequest(CohortManager.getStandard(cohort_id, standard_id), res, next);
  },
  '/:cohort_id/standards/:standard_id/resources': (req, res, next) => {
    const {cohort_id, standard_id} = req.params;
    processRequest(Resource.find(cohort_id, standard_id), res, next);
  },
  '/:cohort_id/students': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(CohortManager.getStudents(cohort_id), res, next);
  },
  '/:cohort_id/instructors': (req, res, next) => {
    const {cohort_id} = req.params;
    processRequest(CohortManager.getInstructors(cohort_id), res, next);
  },
  '/:cohort_id/performances/average': (req, res, next) => {
    const {cohort_id} = req.params;
    if(req.user.isInstructor) {
      processRequest(CohortManager.getAveragePerformances(cohort_id), res, next);
    } else {
      next(new Error('Un-Authorized'));
    }
  },
  '/:cohort_id/performances/:user_id': (req, res, next) => {
    const {cohort_id, user_id} = req.params;
    if(req.user.isInstructor || req.user.learn_id == user_id) {
      processRequest(CohortManager.getPerformances(cohort_id, user_id), res, next);
    } else {
      next(new Error('Un-Authorized'));
    }
  },
  '/:cohort_id/performances/:user_id/average': (req, res, next) => {
    const {cohort_id, user_id} = req.params;
    if(req.user.isInstructor || req.user.learn_id == user_id) {
      processRequest(CohortManager.getAverageStudentPerformances(cohort_id, user_id), res, next);
    } else {
      next(new Error('Un-Authorized'));
    }
  }
};

const router = ezc.createRouter();

function validCohortId(req, res, next) {
  if(!isNaN(req.params.cohort_id)) {
    next();
  } else {
    next(new Error('Invalid cohort id'));
  }
}

Object.keys(routes).forEach(endpoint => router.get(endpoint, validCohortId, routes[endpoint]));

router.post('/:cohort_id/evidences', validCohortId, (req, res, next) => {
  const {cohort_id} = req.params;
  const {success_criteria_id, checked} = req.body;
  processRequest(Student.checkSuccessCriteria(req.user.github_id, cohort_id, success_criteria_id, checked), res, next);
});

router.get('/:cohort_id/standards/collections/:collection_name', validCohortId, (req, res, next) => {
  const {cohort_id, collection_name} = req.params;
  processRequest(StandardCollection.find(cohort_id, collection_name), res, next);
});

router.post('/:cohort_id/standards/collections/:collection_name/:standard_id', validCohortId, CohortManager.isInstructor, (req, res, next) => {
  const {cohort_id, collection_name, standard_id} = req.params;
  processRequest(StandardCollection.addStandard(cohort_id, collection_name, standard_id), res, next);
});

router.delete('/:cohort_id/standards/collections/:collection_name/:standard_id', validCohortId, CohortManager.isInstructor, (req, res, next) => {
  const {cohort_id, collection_name, standard_id} = req.params;
  processRequest(StandardCollection.removeStandard(cohort_id, collection_name, standard_id), res, next);
});

router.post('/:cohort_id/standards/:standard_id/resources', validCohortId, CohortManager.isInstructor, (req, res, next) => {
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
