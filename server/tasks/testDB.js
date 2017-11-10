const queries = require('../db/queries');

queries
  .getUserPerformances(149, 2353)
  .then(result => {
    console.log(result);
  });
