const ezc = require('express-zero-config');
const auth = require('auth-github-org');
const at = require('at-quotes');

const router = ezc.createRouter();

router.get('/', (req, res) => {
  res.json({
    title: 'Mastery API',
    version: '1.0.0',
    user: req.user,
    message: at.getQuote()
  });
});

router.use('/auth', require('./auth'));

router.use((req, res, next) => {
  if(!req.user.learn_id) {
    res.status(401);
    res.json({
      message: 'You must exchange your token before making requests.'
    });
  } else {
    next();
  }
});

router.use(auth.ensureLoggedIn);

router.use('/learn', require('./learn'));
router.use('/cohorts', require('./cohorts'));
router.use('/evidence', require('./evidence'));

module.exports = router;
