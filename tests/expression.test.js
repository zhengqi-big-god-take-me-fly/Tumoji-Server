var test = require('./utils.js').test;
var data = require('./utils.js').data;
var assert = require('assert');
var _ = require('lodash');

describe('测试expression', function () {

  it('未登陆不可以上传表情', function () {
    return test('post', '/api/expressions')
      .send(data.expressions[0])
      .expect(401);
  });

  it('登陆后可以上传表情', function () {
    var p1 = test('post', '/api/expressions', data.userToken.accessToken)
      .send(data.expressions[0])
      .expect(200)
      .then(function (res) {
        assert(_.isMatch(res.body, data.expressions[0]));
        assert.equal(res.body.authorId, data.userToken.id);
        data.expressions[0] = res.body;
      });
    var p2 = test('post', '/api/expressions', data.adminToken.accessToken)
      .send(data.expressions[1])
      .expect(200)
      .then(function (res) {
        assert(_.isMatch(res.body, data.expressions[1]));
        assert.equal(res.body.authorId, data.adminToken.id);
        data.expressions[1] = res.body;
      });
    return Promise.all([p1, p2]);
  });

  it('未登陆可以获取表情列表', function () {
    return test('get', '/api/expressions')
      .expect(200)
      .then(function (res) {
        assert(_.isArray(res.body));
        assert.equal(res.body.length, 2);
        assert.deepEqual(_.sortBy(res.body, 'id'), _.sortBy(data.expressions, 'id'));
      });
  });

  it('普通用户可以修改自己上传的表情', function () {
    var newTitle = 'new title';
    return test('put', '/api/expressions/' + data.expressions[0].id, data.userToken.accessToken)
      .send({title: newTitle})
      .expect(200)
      .then(function (res) {
        assert.equal(res.body.title, newTitle);
        data.expressions[0].title = res.body.title;
      });
  });

  it('普通用户不可以修改其他人上传的表情', function () {
    var newTitle = 'new title';
    return test('put', '/api/expressions/' + data.expressions[1].id, data.userToken.accessToken)
      .send({title: newTitle})
      .expect(401);
  });

  it('管理员可以修改任何人上传的表情', function () {
    var newTitle = 'why are you so diao';
    return test('put', '/api/expressions/' + data.expressions[0].id, data.adminToken.accessToken)
      .send({title: newTitle})
      .expect(200)
      .then(function (res) {
        assert.equal(res.body.title, newTitle);
        data.expressions[0].title = res.body.title;
      });
  });

});