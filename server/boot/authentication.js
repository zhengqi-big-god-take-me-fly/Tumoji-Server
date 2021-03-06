'use strict';

var loopback = require('loopback');
var loopbackContext = require('loopback-context');

module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();
  server.use(loopbackContext.perRequest());
  server.use(loopback.token());
  server.use(function setCurrentUser(req, res, next) {
    if (!req.accessToken) {
      return next();
    }
    server.models.user.findById(req.accessToken.userId, function(err, user) {
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
  });
};
