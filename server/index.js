const ezc = require('express-zero-config');
const router = require('./router');

const app = ezc.createApp({
  router,
  static_dir: `${__dirname}/public`
});

const server = ezc.createServer(app);

server.start();

module.exports = app;
