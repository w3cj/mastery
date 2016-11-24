function nextError(next) {
  return function(error) {
    next(error);
  };
}

function resJSON(res) {
  return function(data) {
    res.json(data);
  };
}

module.exports = {resJSON, nextError};
