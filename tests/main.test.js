'use strict';

var app = require('../server/server');

var startServer = function (done) {

  app.once('started', done);
  app.start();

};

describe('REST API request', function() {

  it('启动服务器', function (done) {
    this.timeout(10000);
    startServer(done);
  });

  require('./users.test.js');

});
