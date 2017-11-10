const knex = require('knex');

require('dotenv').config();

const connection = knex({
  client: 'pg',
  connection: {
    host : process.env.LEARN_DB_HOST,
    user : process.env.LEARN_DB_USER,
    password : process.env.LEARN_DB_PASS,
    database : 'learn_production'
  }
});

module.exports = connection;
