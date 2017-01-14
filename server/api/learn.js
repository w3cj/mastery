const ezc = require('express-zero-config');
const jwt = require('jsonwebtoken');

const {getLearnUser, fetchCohortInfo, getStudentImages} = require('../lib/learnInterface');

const routes = {
  '/cohorts': (req, res, next) => {
    const user = req.user;

		getLearnUser(user.learn_id)
			.then(learnUser => {
				Promise.all(learnUser.cohorts.map(cohort_id => {
					return fetchCohortInfo(cohort_id);
				})).then(cohorts => {
					res.json(cohorts);
				});
			});
  },
  '/cohorts/:user_id': (req, res, next) => {
    const {user_id} = req.params;

    getLearnUser(user_id)
      .then(learnUser => {
        Promise.all(learnUser.cohorts.map(cohort_id => {
          return fetchCohortInfo(cohort_id);
        })).then(cohorts => {
          res.json(cohorts);
        });
      });
  },
  '/cohorts/:cohort_id/student-images': (req, res, next) => {
    const {cohort_id} = req.params;

    getStudentImages(cohort_id)
      .then(students => {
        res.json(students);
      });
  }
};

const router = ezc.createRouter();

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

module.exports = router;
