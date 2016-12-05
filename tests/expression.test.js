var test = require('./utils.js').test;
var data = require('./utils.js').data;
var assert = require('assert');
var _ = require('lodash');

describe('测试expression', function () {

  it('未登陆不可以上传表情', function (done) {
    test('post', '/api/expressions')
      .send(data.expressions[0])
      .expect(401, done);
  });

  it('登陆后可以上传表情', function (done) {
    var p1 = new Promise(function (resolve, reject) {
      test('post', '/api/expressions', data.userToken.accessToken)
        .send(data.expressions[0])
        .expect(200, function (err, res) {
          assert.ifError(err);
          assert(_.isMatch(res.body, data.expressions[0]));
          assert.equal(res.body.authorId, data.userToken.id);
          data.expressions[0] = res.body;
          resolve();
        });
    });
    var p2 = new Promise(function (resolve, reject) {
      test('post', '/api/expressions', data.adminToken.accessToken)
        .send(data.expressions[1])
        .expect(200, function (err, res) {
          assert.ifError(err);
          assert(_.isMatch(res.body, data.expressions[1]));
          assert.equal(res.body.authorId, data.adminToken.id);
          data.expressions[1] = res.body;
          resolve();
        });
    });
    Promise.all([p1, p2])
      .then(function () {
        done();
      });
  });

  it('未登陆可以获取表情列表', function (done) {
    test('get', '/api/expressions')
      .expect(200, function (err, res) {
        assert.ifError(err);
        assert(_.isArray(res.body));
        assert.equal(res.body.length, 2);
        assert.deepEqual(res.body, data.expressions);
        done();
      });
  });

  it('普通用户可以修改自己上传的表情', function (done) {
    var newTitle = 'new title';
    test('put', '/api/expressions/' + data.expressions[0].id, data.userToken.accessToken)
      .send({title: newTitle})
      .expect(200, function (err, res) {
        assert.ifError(err);
        assert.equal(res.body.title, newTitle);
        data.expressions[0].title = res.body.title;
        done();
      });
  });

  it('普通用户不可以修改其他人上传的表情', function (done) {
    var newTitle = 'new title';
    test('put', '/api/expressions/' + data.expressions[1].id, data.userToken.accessToken)
      .send({title: newTitle})
      .expect(401, done);
  });

  it('管理员可以修改任何人上传的表情', function (done) {
    var newTitle = 'why are you so diao';
    test('put', '/api/expressions/' + data.expressions[0].id, data.adminToken.accessToken)
      .send({title: newTitle})
      .expect(200, function (err, res) {
        assert.ifError(err);
        assert.equal(res.body.title, newTitle);
        data.expressions[0].title = res.body.title;
        done();
      });
  });

});