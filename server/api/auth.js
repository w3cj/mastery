const ezc = require('express-zero-config');
const jwt = require('jsonwebtoken');

const {Instructor, Student} = require('../models');
const {getLearnUser, getLearnUserByEmail} = require('../lib/learn/learnInterface');

function resUserToken(res, user) {
  const authConfig = require('../auth-github.config');
  res.clearCookie('x-auth-token', authConfig.cookieOptions);
  jwt.sign(user, authConfig.token_secret, {},
    (err, token) => {
      if (err) return next(err);
      res.json({
        token
      })
    });
}

const routes = {
  '/exchange': (req, res, next) => {
    const user = req.user;

    console.log('exchanging user:', user);
    Promise.all([
      Instructor
        .find(req.user.github_id),
      Student
        .find(req.user.github_id, 'id')
    ]).then(users => {
      console.log('found users', users);
      const instructor = users[0];
      const student = users[1];
      const learn_id = instructor && instructor.admin ? instructor.id : student ? student.id : null;

      if(learn_id) {
        user.learn_id = learn_id;
        user.isInstructor = instructor ? true : false;

        getLearnUser(learn_id)
          .then(learnUser => {
            user.auth_token = learnUser.auth_token;
            resUserToken(res, user);
          });
      } else {
        console.log('learn user not found, finding by email:', user.email);
        getLearnUserByEmail(user.email)
          .then(learnUser => {
            user.learn_id = learnUser.id;
            user.isInstructor = learnUser.admin;
            user.auth_token = learnUser.auth_token;

            resUserToken(res, user);
          });
      }
    });
  }
};

const router = ezc.createRouter();

Object.keys(routes).forEach(endpoint => router.get(endpoint, routes[endpoint]));

module.exports = router;
