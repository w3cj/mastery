const API_URL = window.location.host.indexOf('localhost') > -1 ? 'http://localhost:3000/api/v1/' : 'https://mastery-api.galvanize.network/api/v1/';

function fetchJSON(endpoint) {
  return fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
      Credentials: 'include'
    }
  }).then(response => {
    return response.json();
  })
}

function postJSON(endpoint, body) {
  return fetchWithBody('POST', endpoint, body);
}

function deleteJSON(endpoint, body) {
  return fetchWithBody('DELETE', endpoint, body);
}

function fetchWithBody(method, endpoint, body) {
  return fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${localStorage.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(response => {
    return response.json();
  });
}

module.exports = {
  API_URL,
  fetchJSON,
  postJSON,
  deleteJSON,
  fetchWithBody
}
