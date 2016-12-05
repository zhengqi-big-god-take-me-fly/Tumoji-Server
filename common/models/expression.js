var _ = require('lodash');
var utils = require('loopback/lib/utils');

module.exports = function(Expression) {

  var disabledMethods = [
    { name: 'createChangeStream'  , isStatic: true},
    { name: '__delete__tags'      , isStatic: false},
    { name: '__create__likes'     , isStatic: false},
    { name: '__updateById__likes' , isStatic: false},
    { name: '__destroyById__likes', isStatic: false}
  ];

// disable remote methods
  disabledMethods.forEach(function (method) {
    Expression.disableRemoteMethod(method.name, method.isStatic);
  });

// set author id
  Expression.beforeRemote('create', function (context, modelInstance, next) {
    // console.log(context.args);
    context.args.data.authorId = context.req.accessToken.userId;
    context.args.data.createdAt = new Date();
    next();
  });

};