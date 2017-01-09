const ezc = require('express-zero-config');
const auth = require('auth-github-org');
const cors = require('cors');
const emojiFavicon = require('emoji-favicon');
const path = require('path');

require('dotenv').config();

const api = require('./api');
const authConfig = require('./auth-github.config');

const router = ezc.createRouter();

router.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

router.use(emojiFavicon('white_check_mark'));

router.get('/', (req, res) => {
  res.json({
    message: 'Galvanize Mastery API'
  });
});

router.use(auth.checkTokenSetUser);
router.use('/auth', auth.config(authConfig));
router.use('/api/v1', api);

const app = ezc.createApp({
  router
});

const server = ezc.createServer(app);

server.start();
