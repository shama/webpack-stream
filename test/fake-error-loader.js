module.exports = function fakeErrorLoader (text) {
  this.cacheable();

  const fakeError = new Error('Fake error');
  // delete stack trace prevent it from showing up in webpack output
  delete fakeError.stack;
  this.emitError(fakeError);

  return text;
};
