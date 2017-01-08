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

function resUnAuthorized(res) {
  res.status(401);
  res.json({message: 'UnAuthorized.'});
}

module.exports = {resJSON, nextError, resUnAuthorized};
