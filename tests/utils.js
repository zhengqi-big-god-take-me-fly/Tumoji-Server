'use strict';

var app = require('../server/server');
var request = require('supertest-as-promised')(Promise);

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
  },
  images: [],
  expressions: [
    {
      title: 'why are you so diao',
      image: 'http://www.338283.com/uploads/allimg/c151013/1444Fa0KL0-24952.jpg'
    }, {
      title: 'stand back, i am going to zhuang bi',
      image: 'http://pics.sc.chinaz.com/Files/pic/faces/3574/01.jpg'
    }
  ],
  tags: [
    {
      name: 'tag0'
    }, {
      name: 'tag1'
    }, {
      name: 'tag2'
    }, {
      name: 'tag3'
    }
  ]
};

module.exports = {
  test: test,
  data: data
};
