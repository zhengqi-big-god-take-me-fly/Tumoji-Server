var test = require('./utils.js').test;
var data = require('./utils.js').data;
var assert = require('assert');
var _ = require('lodash');

module.exports = function () {

  describe('测试tag', function () {

    describe('创建', function () {

      it('未登陆不可以创建', function () {
        return test('post', '/api/tags')
          .send(data.tags[0])
          .expect(401);
      });

      it('登陆后可以创建', function () {
        return test('post', '/api/tags', data.userToken.accessToken)
          .send(data.tags[0])
          .expect(200)
          .then(function (res) {
            assert(_.isMatch(res.body, data.tags[0]));
            data.tags[0] = res.body;
          });
      });

      it('管理员可以创建', function () {
        return test('post', '/api/tags', data.adminToken.accessToken)
          .send(data.tags[1])
          .expect(200)
          .then(function (res) {
            assert(_.isMatch(res.body, data.tags[1]));
            data.tags[1] = res.body;
          });
      });

    });

    describe('获取', function () {

      it('任何人可以获取标签列表', function () {
        return test('get', '/api/tags')
          .expect(200)
          .then(function (res) {
            assert(_.isArray(res.body));
            assert.equal(res.body.length, 2);
            assert.deepEqual(_.sortBy(res.body, 'name'), _.sortBy([data.tags[0], data.tags[1]], 'name'));
          });
      });

    });

    describe('修改', function () {

      it('未登录不能修改', function () {
        var newDescription = 'new description';
        return test('put', '/api/tags/' + data.tags[0].name)
          .send({description: newDescription})
          .expect(401);
      });

      it('登陆后不能修改', function () {
        var newDescription = 'new description';
        return test('put', '/api/tags/' + data.tags[0].name, data.userToken.accessToken)
          .send({description: newDescription})
          .expect(401);
      });

      it('管理员可以修改', function () {
        var newDescription = 'new description';
        return test('put', '/api/tags/' + data.tags[0].name, data.adminToken.accessToken)
          .send({description: newDescription})
          .expect(200)
          .then(function (res) {
            assert.equal(res.body.description, newDescription);
            data.tags[0] = res.body;
          });
      });

    });

    describe('表情接口', function () {

      describe('创建并连接', function () {

        it('未登陆不能通过表情接口创建', function () {
          return test('post', '/api/expressions/' + data.expressions[0].id + '/tags')
            .expect(401);
        });

        it('普通用户不可以通过表情接口创建', function () {
          return test('post', '/api/expressions/' + data.expressions[1].id + '/tags', data.userToken.accessToken)
            .expect(401);
        });

        it('作者可以通过表情接口创建', function () {
          return test('post', '/api/expressions/' + data.expressions[0].id + '/tags', data.userToken.accessToken)
            .send(data.tags[2])
            .expect(200)
            .then(function (res) {
              assert(_.isMatch(res.body, data.tags[2]));
              data.tags[2] = res.body;
            })
            .then(function () {
              // 检查连接
              return test('get', '/api/tags/' + data.tags[2].name + '/expressions', data.userToken.accessToken)
                .expect(200)
                .then(function (res) {
                  assert(_.isArray(res.body));
                  assert.equal(res.body.length, 1);
                  assert.deepEqual(res.body[0], data.expressions[0]);
                });
            });
        });

        it('管理员可以通过表情接口创建', function () {
          return test('post', '/api/expressions/' + data.expressions[0].id + '/tags', data.adminToken.accessToken)
            .send(data.tags[3])
            .expect(200)
            .then(function (res) {
              assert(_.isMatch(res.body, data.tags[3]));
              data.tags[3] = res.body;
            })
            .then(function () {
              // 检查连接
              return test('get', '/api/tags/' + data.tags[3].name + '/expressions', data.adminToken.accessToken)
                .expect(200)
                .then(function (res) {
                  assert(_.isArray(res.body));
                  assert.equal(res.body.length, 1);
                  assert.deepEqual(res.body[0], data.expressions[0]);
                });
            });
        });

      });

      describe('获取', function () {

        it('任何人可以通过表情接口获取标签', function () {
          return test('get', '/api/expressions/' + data.expressions[0].id + '/tags')
            .expect(200)
            .then(function (res) {
              assert(_.isArray(res.body));
              assert.equal(res.body.length, 2);
            });
        });

        it('任何人可以通过标签接口获取表情', function () {
          return test('get', '/api/tags/' + data.tags[2].name + '/expressions')
            .expect(200)
            .then(function (res) {
              assert(_.isArray(res.body));
              assert.equal(res.body.length, 1);
              assert.deepEqual(res.body[0], data.expressions[0]);
            });
        });

      });

      describe('链接', function () {

        it('未登陆不可以链接', function () {
          return test('put', '/api/expressions/' + data.expressions[1].id + '/tags/rel/' + data.tags[1].name)
            .expect(401);
        });

        it('普通用户不能链接他人的表情', function () {
          return test('put', '/api/expressions/' + data.expressions[1].id + '/tags/rel/' + data.tags[1].name, data.userToken.accessToken)
            .expect(401);
        });

        it('作者可以链接自己的表情', function () {
          return test('put', '/api/expressions/' + data.expressions[0].id + '/tags/rel/' + data.tags[1].name, data.userToken.accessToken)
            .expect(200)
            .then(function (res) {
              assert(_.isObject(res.body));
              assert.equal(res.body.tagId, data.tags[1].name);
              assert.equal(res.body.expressionId, data.expressions[0].id);
            });
        });

        it('管理员可以链接别人的表情', function () {
          return test('put', '/api/expressions/' + data.expressions[0].id + '/tags/rel/' + data.tags[0].name, data.adminToken.accessToken)
            .expect(200)
            .then(function (res) {
              assert(_.isObject(res.body));
              assert.equal(res.body.tagId, data.tags[0].name);
              assert.equal(res.body.expressionId, data.expressions[0].id);
            });
        });

      });

      describe('取消链接', function () {

        it('未登陆不可以取消链接', function () {
          return test('delete', '/api/expressions/' + data.expressions[1].id + '/tags/rel/' + data.tags[1].name)
            .expect(401);
        });

        it('普通用户不能取消链接他人的表情', function () {
          return test('delete', '/api/expressions/' + data.expressions[1].id + '/tags/rel/' + data.tags[1].name, data.userToken.accessToken)
            .expect(401);
        });

        it('作者可以取消链接自己的表情', function () {
          return test('delete', '/api/expressions/' + data.expressions[0].id + '/tags/rel/' + data.tags[1].name, data.userToken.accessToken)
            .expect(204);
        });

        it('管理员可以取消链接别人的表情', function () {
          return test('delete', '/api/expressions/' + data.expressions[0].id + '/tags/rel/' + data.tags[0].name, data.adminToken.accessToken)
            .expect(204);
        });

      });

      describe('删除', function () {

        it('未登陆不能删除', function () {
          return test('delete', '/api/tags/' + data.tags[0].name)
            .expect(401);
        });

        it('登陆后不能删除', function () {
          return test('delete', '/api/tags/' + data.tags[0].name, data.userToken.accessToken)
            .expect(401);
        });

        it('管理员可以删除', function () {
          return test('delete', '/api/tags/' + data.tags[0].name, data.adminToken.accessToken)
            .expect(200)
            .then(function (res) {
              assert(_.isObject(res.body));
              assert.deepEqual(res.body.count, 1);
            });
        });

      });

    });

  });

};
