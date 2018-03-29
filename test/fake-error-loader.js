module.exports = function fakeErrorLoader (text) {
  this.cacheable();

  var fakeError = new Error('Fake error');
  // delete stack trace prevent it from showing up in webpack output
  delete fakeError.stack;
  this.emitError(fakeError);

  return text;
};
