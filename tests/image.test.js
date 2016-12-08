var test = require('./utils.js').test;
var data = require('./utils.js').data;
var assert = require('assert');
var _ = require('lodash');

describe('测试image', function () {

  it('未登陆不可以上传图片', function () {
    return test('post', '/api/images')
      .attach('file', 'tests/test.png')
      .expect(401);
  });

  it('登陆后可以上传图片', function () {
    return test('post', '/api/images', data.adminToken.accessToken)
      .attach('file', 'tests/test.png')
      .expect(200)
      .then(function (res) {
        data.image = [
          _.cloneDeep(res.body)
        ];
      });
  });

  it('无法上传非图片文件', function () {
    return test('post', '/api/images', data.adminToken.accessToken)
      .attach('file', 'tests/utils.js')
      .expect(400);
  });

  it('未登陆可以下载图片', function () {
    return test('get', '/api/images/download/' + data.image[0].name)
      .set('Accept', 'image/*')
      .expect(200);
  });

  it('普通用户不能删除图片', function () {
    return test('delete', '/api/images/' + data.image[0].name)
      .expect(401);
  });

  it('管理员可以删除图片', function () {
    return test('delete', '/api/images/' + data.image[0].name, data.adminToken.accessToken)
      .expect(200);
  });

});