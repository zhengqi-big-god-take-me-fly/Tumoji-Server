var test = require('./utils.js').test;
var data = require('./utils.js').data;
var assert = require('assert');
var _ = require('lodash');

module.exports = function () {

  describe('测试user', function () {

    it('未登陆可以创建用户', function() {
      return test('post', '/api/users')
        .send(data.user)
        .expect(200)
        .then(function(res) {
          assert(_.isObject(res.body));
          assert(res.body.id, 'must have an id');
          // 获取用户id
          data.userToken.id = res.body.id;
        });
    });

    it('登陆管理员用户', function() {
      return test('post', '/api/users/login')
        .send(data.admin)
        .expect(200)
        .then(function(res) {
          assert(typeof res.body === 'object');
          assert(res.body.id, 'must have an access token');
          // 获取accessToken和id
          data.adminToken.id = res.body.userId;
          data.adminToken.accessToken = res.body.id;
        });
    });

    it('登陆普通用户', function() {
      return test('post', '/api/users/login')
        .send(data.user)
        .expect(200)
        .then(function(res) {
          assert(typeof res.body === 'object');
          assert(res.body.id, 'must have an access token');
          // 返回userId与用户id相同
          assert.equal(res.body.userId, data.userToken.id);
          // 获取accessToken
          data.userToken.accessToken = res.body.id;
        });
    });

    it('管理员能够获取用户列表', function() {
      return test('get', '/api/users', data.adminToken.accessToken)
        .expect(200)
        .then(function(res) {
          assert(_.isArray(res.body));
          assert(!_.isEmpty(res.body));
          assert.equal(res.body.length, 2);
        });
    });

    it('普通用户能够获取用户列表', function() {
      return test('get', '/api/users', data.adminToken.accessToken)
        .expect(200)
        .then(function(res) {
          assert(_.isArray(res.body));
          assert(!_.isEmpty(res.body));
          assert.equal(res.body.length, 2);
        });
    });


    it('获取普通用户身份', function() {
      return test('get', '/api/users/' + data.userToken.id + '/roles', data.userToken.accessToken)
        .expect(200)
        .then(function(res) {
          // console.log(res);
          assert(_.isArray(res.body.roles));
          assert(_.isEmpty(res.body.roles));
        });
    });

    it('获取管理员身份', function() {
      return test('get', '/api/users/' + data.adminToken.id + '/roles', data.adminToken.accessToken)
        .expect(200)
        .then(function(res) {
          assert(_.isArray(res.body.roles));
          assert(_.includes(res.body.roles, 'admin'));
        });
    });

    it('普通用户不能获取其他用户身份', function() {
      return test('get', '/api/users/' + data.adminToken.id + '/roles', data.userToken.accessToken)
        .expect(401);
    });

    it('管理员可以获取其他用户身份', function() {
      return test('get', '/api/users/' + data.userToken.id + '/roles', data.adminToken.accessToken)
        .expect(200)
        .then(function(res) {
          assert(_.isArray(res.body.roles));
          assert(_.isEmpty(res.body.roles));
        });
    });

    it('普通用户不能添加身份', function() {
      return test('post', '/api/users/' + data.userToken.id + '/roles', data.userToken.accessToken)
        .send(['admin'])
        .expect(401);
    });

    it('管理员可以添加身份', function() {
      return test('post', '/api/users/' + data.userToken.id + '/roles', data.adminToken.accessToken)
        .send(['admin'])
        .expect(200)
        .then(function(res) {
          assert(_.isArray(res.body.roleMappings));
          assert(_.every(res.body.roleMappings, function(r) { return r.principalId === data.userToken.id; }));
        })
        .then(function () {
          // 查看是否有admin身份
          return test('get', '/api/users/' + data.userToken.id + '/roles', data.userToken.accessToken)
            .expect(200)
            .then(function(res) {
              assert(_.isArray(res.body.roles));
              assert(_.includes(res.body.roles, 'admin'));
            });
        });
    });

    it('无法添加错误身份', function() {
      return test('post', '/api/users/' + data.userToken.id + '/roles', data.userToken.accessToken)
        .send(['wrong', 'roleee'])
        .expect(404);
    });

    it('删除身份', function() {
      return test('delete', '/api/users/' + data.userToken.id + '/roles/admin', data.adminToken.accessToken)
        .expect(200)
        .then(function() {
          // 查看是否有admin身份
          return test('get', '/api/users/' + data.userToken.id + '/roles', data.userToken.accessToken)
            .expect(200)
            .then(function(res) {
              assert(_.isArray(res.body.roles));
              assert(_.isEmpty(res.body.roles));
            });
        });
    });

  });

};
