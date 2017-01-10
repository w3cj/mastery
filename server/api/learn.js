const ezc = require('express-zero-config');
const jwt = require('jsonwebtoken');

const {getLearnUser, fetchCohortInfo} = require('../lib/learnInterface');

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
  }
};

const router = ezc.createRouter();

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

module.exports = router;
