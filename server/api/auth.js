const ezc = require('express-zero-config');
const jwt = require('jsonwebtoken');

const {Instructor, Student} = require('../models');

const routes = {
  '/exchange': (req, res, next) => {
    Promise.all([
      Instructor
        .find(req.user.github_id, 'id'),
      Student
        .find(req.user.github_id, 'id')
    ]).then(users => {
      const instructor = users[0];
      const student = users[1];
      const user = req.user;

      const learn_id = instructor ? instructor.id : student ? student.id : null;

      if(learn_id) {
        user.learn_id = learn_id;
        user.isInstructor = instructor ? true : false;
        const authConfig = require('../auth-github.config');
        jwt.sign(user, authConfig.token_secret, {},
          (err, token) => {
            if (err) return next(err);
            res.json({
              token
            })
          });
      } else {
        next(new Error('Learn user not found. Make sure your cohort has already been added, and your github username in your learn profile is up to date.'));
      }
    });
  }
};

const router = ezc.createRouter();

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

module.exports = router;
