var test = require('./utils.js').test;
var data = require('./utils.js').data;
var assert = require('assert');
var _ = require('lodash');

module.exports = function () {

  describe('测试点赞功能', function () {

    describe('点赞', function () {

      it('未登陆不可以点赞', function () {
        return test('post', '/api/expressions/' + data.expressions[1].id + '/like')
          .expect(401);
      });

      it('登陆后可以点赞', function () {
        return test('post', '/api/expressions/' + data.expressions[1].id + '/like', data.userToken.accessToken)
          .expect(200)
          .then(function (res) {
            assert(_.isObject(res.body));
            assert.equal(res.body.expressionId, data.expressions[1].id);
            assert.equal(res.body.userId, data.userToken.id);
          })
          .then(function () {
            // 检查是否点赞成功
            return test('get', '/api/expressions/' + data.expressions[1].id + '/likes')
              .expect(200)
              .then(function (res) {
                assert(_.isArray(res.body));
                assert.equal(res.body.length, 1);
                assert.equal(res.body[0].id, data.userToken.id);
              });
          });
      });

      it('可以重复点赞', function () {
        return test('post', '/api/expressions/' + data.expressions[1].id + '/like', data.userToken.accessToken)
          .expect(200)
          .then(function (res) {
            assert(_.isObject(res.body));
            assert.equal(res.body.expressionId, data.expressions[1].id);
            assert.equal(res.body.userId, data.userToken.id);
          });
      });

    });

    describe('取消点赞', function () {

      it('未登陆不可以取消点赞', function () {
        return test('delete', '/api/expressions/' + data.expressions[1].id + '/like')
          .expect(401);
      });

      it('未点赞表情不可取消点赞', function () {
        return test('delete', '/api/expressions/' + data.expressions[0].id + '/like', data.userToken.accessToken)
          .expect(200);
      });

      it('可以正常取消点赞', function () {
        return test('delete', '/api/expressions/' + data.expressions[1].id + '/like', data.userToken.accessToken)
          .expect(200)
          .then(function () {
            // 检查是否取消点赞成功
            return test('get', '/api/expressions/' + data.expressions[1].id + '/likes')
              .expect(200)
              .then(function (res) {
                assert(_.isArray(res.body));
                assert.equal(res.body.length, 0);
              });
          });
      });

    });

  });

};
