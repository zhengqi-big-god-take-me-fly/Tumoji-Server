'use strict';

var app = require('../server/server');
var request = require('supertest');

var test = function (verb, url, auth) {
  var promise = request(app)[verb](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  if (auth && typeof auth === 'string') {
    promise = promise
      .set('Authorization', auth);
  }

  return promise;
};

var data = {
  user: {
    username: 'tidyzq',
    password: '123456',
    email: 'tidyzq@tidyzq.com'
  },
  userToken: {
    id: 0,
    accessToken: ''
  },
  admin: {
    username: 'admin',
    password: 'admin',
    email: 'admin@admin.com'
  },
  adminToken: {
    id: 0,
    accessToken: ''
  }
};

module.exports = {
  test: test,
  data: data
};
