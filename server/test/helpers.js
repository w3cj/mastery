function xtest(description) {
  console.log('Pending:', description);
}

function hasProperty(t, object, property) {
  return t.equals(object.hasOwnProperty(property), true, `Missing property ${property}`);
}

module.exports = {
  xtest,
  hasProperty
};
