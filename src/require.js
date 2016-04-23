// Allows libraries used within tools to be used outside of it

module.exports = function(library) {
  var returnLibrary;
  try {
    returnLibrary = require(library);
  } catch() {
    returnLibrary = undefined;
  }
  return returnLibrary;
};
