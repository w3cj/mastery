const fetch = require('isomorphic-fetch');

require('dotenv').load();

function getAuthHeader() {
  return {
    headers: {
      Authorization: `Bearer ${process.env.LEARN_AUTH_TOKEN}`
    }
  };
}

function postJSON(url, options, body) {
  options.method = 'POST';
  options.headers = options.headers || {};
  options.headers['Content-Type'] = 'application/json';
  options.body = JSON.stringify(body);
  return fetch(url, options)
    .then(response => {
      return response.json();
    });
}

function fetchJSON(url, options) {
  return fetch(url, options)
    .then(response => {
      if(response.status != 200) {
        throw new Error(response.statusText);
      }

      return response.json();
    });
}

function fetchText(url, options) {
  return fetch(url, options)
    .then(response => {
      return response.text();
    });
}

module.exports = {fetchJSON, fetchText, postJSON, getAuthHeader};
