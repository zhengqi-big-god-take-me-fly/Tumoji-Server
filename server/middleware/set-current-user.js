'use strict';

var loopbackContext = require('loopback-context');

module.exports = function () {
  return function setCurrentUser(req, res, next) {
    if (!req.accessToken) {
      return next();
    }
    req.app.models.user.findById(req.accessToken.userId, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new Error('No user with this access token was found.'));
      }
      var currentContect = loopbackContext.getCurrentContext();
      if (currentContect) {
        currentContect.set('currentUser', user);
      }
      next();
    });
  };
};
