var utils = require('loopback/lib/utils');
var extendInclude = require('../utils/extend-include');
// var overrideRemoteMethod = require('../utils/override-remote-method');
var path = require('path');
var _ = require('lodash');

module.exports = function(Image) {

  var disabledMethods = [
    {name: 'create', isStatic: true},
    {name: 'upsert', isStatic: true}
  ];

  var allowedContentTypes = [
    'image/jpeg',
    'image/pjpeg',
    'image/bmp',
    'image/gif',
    'image/png'
  ];

  // disable remote methods
  disabledMethods.forEach(function (method) {
    Image.disableRemoteMethod(method.name, method.isStatic);
  });


  Image.upload = function (context, options, callback) {
    options = options || {};
    options.allowedContentTypes = allowedContentTypes;
    callback = callback || utils.createPromiseCallback();
    context.req.params.container = 'image';
    var Storage = Image.app.models.storage;
    var hostUrl = Image.app.get('baseUrl');

    return Storage.upload(context.req, context.result, options, function (err, fileObj) {
      if (err) {
        err.statusCode = 400;
        err.code = 'BAD_REQUEST';
        callback(err);
      } else {
        var fileInfo = fileObj.files.file[0];
        Image.create({
          name: fileInfo.name,
          type: fileInfo.type,
          url: hostUrl + '/api/images/download/' + fileInfo.name
        }, callback);
      }
    });

  };

  Image.remoteMethod(
    'upload',
    {
      description: 'Uploads a file',
      accepts: [
        { arg: 'context', type: 'object', http: { source: 'context' } },
        { arg: 'options', type: 'object', http: { source: 'query' } }
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true
      },
      http: {path: '/', verb: 'post'},
    }
  );

  Image.remoteMethod(
    'find',
    {
      description: 'Find a file by its name',
      accepts: [
        { arg: 'filter', type: 'string', required: false }
      ],
      returns: {
        arg: 'files', type: 'object', root: true
      },
      http: {path: '/', verb: 'get'},
    }
  );

  Image.remoteMethod(
    'findById',
    {
      description: 'Find a file by its name',
      accepts: [
        { arg: 'name', type: 'string', required: true },
        { arg: 'filter', type: 'string', required: false }
      ],
      returns: {
        arg: 'file', type: 'object', root: true
      },
      http: {path: '/:name', verb: 'get'},
    }
  );

  Image.download = function (name, context, callback) {
    var Storage = Image.app.models.storage;
    return Storage.download('image', name, context.req, context.res, callback);
  };

  Image.remoteMethod(
    'download',
    {
      description: 'Download a file',
      accepts: [
        { arg: 'name', type: 'string', required: true },
        { arg: 'context', type: 'object', http: { source: 'context' } }
      ],
      http: {path: '/download/:name', verb: 'get'},
    }
  );

  Image.deleteByName = function (name, callback) {
    var Storage = Image.app.models.storage;
    return Storage.removeFile('image', name, function (err) {
      if (err) {
        callback(err);
      } else {
        return Image.deleteById(name, callback);
      }
    });
  };

  Image.remoteMethod(
    'deleteByName',
    {
      description: 'Delete a file',
      accepts: [
        { arg: 'name', type: 'string', required: true },
      ],
      returns: {
        arg: 'result', type: 'object', root: true
      },
      http: {path: '/:name', verb: 'delete'},
    }
  );

};
