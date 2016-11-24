const fetch = require('isomorphic-fetch');

require('dotenv').load();

function getAuthHeader() {
  return {
    headers: {
      Authorization: `Bearer ${process.env.LEARN_AUTH_TOKEN}`
    }
  };
}

function fetchJSON(url, options) {
  return fetch(url, options)
    .then(response => {
      return response.json();
    });
}

function fetchText(url, options) {
  return fetch(url, options)
    .then(response => {
      return response.text();
    });
}

module.exports = {fetchJSON, fetchText, getAuthHeader};
