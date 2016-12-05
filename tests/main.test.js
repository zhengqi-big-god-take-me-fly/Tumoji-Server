'use strict';

var app = require('../server/server');
var loopback = require('loopback');

var startServer = function (done) {

  if (app.loaded) {
    app.once('started', done);
    app.start();
  } else {
    app.once('loaded', function() {
      app.once('started', done);
      app.start();
    });
  }

};

describe('REST API request', function() {

  before(function (done) {
    this.timeout(10000);
    startServer(done);
  });

  require('./users.test.js');

});
