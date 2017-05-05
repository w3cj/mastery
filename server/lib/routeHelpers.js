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
  res.json({message: 'Un-Authorized.'});
}

function processRequest(promise, res, next) {
  promise
    .then(resJSON(res))
    .catch(nextError(next));
}

function isInstructor(req, res, next) {
  if(req.user.isInstructor) {
    next();
  } else {
    resUnAuthorized(res);
  }
}

function authorize(req, res, next) {
  const {user_id, student_id} = req.params;
  if(!user_id && !student_id) return next();
  if(req.user.isInstructor || req.user.learn_id == user_id || req.user.learn_id == student_id) {
    next();
  } else {
    next(new Error('Un-Authorized'));
  }
}

module.exports = {resJSON, nextError, resUnAuthorized, processRequest, authorize, isInstructor};
