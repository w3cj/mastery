const {User} = require('./models');

require('dotenv').load();

module.exports = {
  auth_URL: process.env.AUTH_URL,
  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET,
  token_secret: process.env.TOKEN_SECRET,
  clients: [{
    name: 'mastery',
    callback: 'http://localhost:8080/#/auth/callback/'
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
