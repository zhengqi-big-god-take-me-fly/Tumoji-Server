var _ = require('lodash');
var utils = require('loopback/lib/utils');

module.exports = function(Tag) {

  var disabledMethods = [
    { name: 'replaceOrCreate'           , isStatic: true},
    { name: 'upsertWithWhere'           , isStatic: true},
    { name: 'replaceById'               , isStatic: true},
    { name: 'createChangeStream'        , isStatic: true},
    { name: '__create__expressions'     , isStatic: false},
    { name: '__delete__expressions'     , isStatic: false},
    { name: '__findById__expressions'   , isStatic: false},
    { name: '__updateById__expressions' , isStatic: false},
    { name: '__destroyById__expressions', isStatic: false},
    { name: '__link__expressions'       , isStatic: false},
    { name: '__unlink__expressions'     , isStatic: false},
    { name: '__exists__expressions'     , isStatic: false},
  ];

// disable remote methods
  disabledMethods.forEach(function (method) {
    Tag.disableRemoteMethod(method.name, method.isStatic);
  });

};
