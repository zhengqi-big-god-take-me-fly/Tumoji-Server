var _ = require('lodash');
var utils = require('loopback/lib/utils');
var LoopBackContext = require('loopback-context');

module.exports = function(Expression) {

  var disabledMethods = [
    { name: 'replaceOrCreate'     , isStatic: true},
    { name: 'upsertWithWhere'     , isStatic: true},
    { name: 'replaceById'         , isStatic: true},
    { name: 'createChangeStream'  , isStatic: true},
    { name: '__delete__tags'      , isStatic: false},
    { name: '__findById__tags'    , isStatic: false},
    { name: '__updateById__tags'  , isStatic: false},
    { name: '__destroyById__tags' , isStatic: false},
    { name: '__create__likes'     , isStatic: false},
    { name: '__delete__likes'     , isStatic: false},
    { name: '__findById__likes'   , isStatic: false},
    { name: '__updateById__likes' , isStatic: false},
    { name: '__destroyById__likes', isStatic: false},
    { name: '__link__likes'       , isStatic: false},
    { name: '__unlink__likes'     , isStatic: false}
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

  Expression.prototype.like = function (callback) {
    callback = callback || utils.createPromiseCallback();
    var ctx = LoopBackContext.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    this['__link__likes'](currentUser.id, callback);
    return callback.promise;
  };

  Expression.remoteMethod(
    'like',
    {
      description: 'Like a expression',
      http: {path: '/like', verb: 'post'},
      returns: {root: true, type: 'object'},
      isStatic: false
    }
  );

  Expression.prototype.unlike = function (callback) {
    callback = callback || utils.createPromiseCallback();
    var ctx = LoopBackContext.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    this['__unlink__likes'](currentUser.id, callback);
    return callback.promise;
  };

  Expression.remoteMethod(
    'unlike',
    {
      description: 'UnLike a expression',
      http: {path: '/unlike', verb: 'post'},
      returns: {root: true, type: 'object'},
      isStatic: false
    }
  );

};
