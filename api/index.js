const ezc = require('express-zero-config');

const router = ezc.createRouter();

router.get('/', (req, res) => {
  res.json({
    message: 'Mastery API'
  });
});

router.use('/cohorts', require('./cohorts'));

module.exports = router;
