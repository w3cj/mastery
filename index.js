const ezc = require('express-zero-config');
const auth = require('auth-github-org');
const path = require('path');

const api = require('./api');
const authConfig = require('./auth-github.config');

const router = ezc.createRouter();

router.use(auth.checkTokenSetUser);
router.use('/auth', auth.config(authConfig));
router.use('/api/v1', auth.ensureLoggedIn, api);

const app = ezc.createApp({
  router,
  static_dir: path.join(__dirname, 'client')
});

const server = ezc.createServer(app);

server.start();
