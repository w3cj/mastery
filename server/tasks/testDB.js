const queries = require('../db/queries');

queries
  .getCohort(149)
  .then(result => {
    console.log(result);
  });
