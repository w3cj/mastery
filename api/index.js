const ezc = require('express-zero-config');
const at = require('at-quotes');

const {Instructor} = require('../models');

const router = ezc.createRouter();

router.use((req, res, next) => {
  Instructor
    .find(req.user.github_id)
    .then(instructor => {
      req.user.isInstructor = instructor ? true : false;
      next();
    });
});

router.get('/', (req, res) => {
  res.json({
    title: 'Mastery API',
    version: '1.0.0',
    user: req.user,
    message: at.getQuote()
  });
});

router.use('/cohorts', require('./cohorts'));

module.exports = router;
