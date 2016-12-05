'use strict';

// https://github.com/strongloop/loopback/issues/443#issuecomment-222662940
module.exports = function overrideRemoteMethod (model, methodName, newFunc) {
  var origFunc = model[methodName];
  var origMethodName = 'orig' + methodName[0].toUpperCase() + methodName.slice(1);
  model[origMethodName] = origFunc;
  model[methodName] = function () {
    // We rely on the remote method call having a different signature to
    // the standard call.
    return newFunc.apply(model, arguments);
  };
};
