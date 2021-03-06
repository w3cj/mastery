const {User} = require('./models');

require('dotenv').load();

module.exports = {
  auth_URL: process.env.AUTH_URL,
  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET,
  token_secret: process.env.TOKEN_SECRET,
  cookieOptions: {
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.NODE_ENV == 'production'
  },
  clients: [{
    name: 'mastery',
    callback: `${process.env.CORS_ORIGIN}#/auth/callback/`
  }],
  orgs: [{
    name: 'gschool'
  }, {
    name: 'zipfian'
  }],
  findUser(github_id) {
    return User.find(github_id);
  },
  insertUser(user) {
    return User.insert(user);
  }
};
