var utils = require('loopback/lib/utils');
var extendInclude = require('../utils/extend-include');
var overrideRemoteMethod = require('../utils/override-remote-method');
var _ = require('lodash');

module.exports = function(User) {

  var disabledMethods = [
    // {name: '__get__accessTokens', isStatic: false}
  ];

  // disable remote methods
  disabledMethods.forEach(function (method) {
    User.disableRemoteMethod(method.name, method.isStatic);
  });

  // override build-in findById
  User.remoteFindById = function (id, filter, callback) {
    if (_.isFunction(filter)) {
      callback = filter;
      filter = {};
    }
    callback = callback || utils.createPromiseCallback();
    filter = filter || {};
    filter.include = extendInclude(filter.include);

    if (_.some(filter.include, {relation: 'roles'})) {
      _.remove(filter.include, {relation: 'roles'});

      return User.origFindById(id, filter)
        .then(function (user) {
          return user.getRolesById()
            .then(function (roles) {
              user.roles = roles;
              return user;
            });
        })
        .then(function (result) {
          callback(null, result);
          return result;
        })
        .catch(function (err) {
          callback(err);
          throw err;
        });

    } else {
      return User.origFindById(id, filter, callback);
    }
  };

  // override build-in find
  User.remoteFind = function (filter, callback, c) {
    if (!_.isFunction(callback)) {
      callback = c;
    }
    callback = callback || utils.createPromiseCallback();
    filter = filter || {};
    filter.include = extendInclude(filter.include);
    if (_.some(filter.include, {relation: 'roles'})) {
      _.remove(filter.include, {relation: 'roles'});
      return User.origFind(filter)
        .then(function(users) {
          var filter = function (user) {
            return user.getRolesById()
              .then(function (roles) {
                user.roles = roles;
                return user;
              });
          };
          var promises = _.map(users, filter);
          return Promise.all(promises);
        })
        .then(function (result) {
          callback(null, result);
          return result;
        })
        .catch(function (err) {
          callback(err);
          throw err;
        });

    } else {
      return User.origFind(filter, callback);
    }

  };

  // override build in methods
  User.on('attached', function () {

    overrideRemoteMethod(User, 'findById', User.remoteFindById);
    overrideRemoteMethod(User, 'find', User.remoteFind);

  });

  // add get role method to User
  User.prototype.getRolesById = function (cb) {
    cb = cb || utils.createPromiseCallback();
    var RoleMapping = User.app.models.RoleMapping,
        user = this;

    return RoleMapping.find({
      where: {
        principalType: RoleMapping.USER,
        principalId: user.id
      },
      include: 'role'
    })
    .then(function (roleMappings) {
      var filter = function (roleMapping) {
        return roleMapping.role().name;
      };
      var roles = _.map(roleMappings, filter);
      return roles;
    })
    .then(function (result) {
      cb(null, result);
      return result;
    })
    .catch(function (err) {
      cb(err);
      throw err;
    });

  };

  User.remoteMethod(
    'getRolesById',
    {
      description: 'Get roles for a user',
      http: {path: '/roles', verb: 'get'},
      returns: {arg: 'roles', type: 'object'},
      isStatic: false
    }
  );

  // add put role method to User
  User.prototype.addRolesById = function (roleNames, cb) {
    cb = cb || utils.createPromiseCallback();
    if (_.isObject(roleNames) && !_.isArray(roleNames)) {
      roleNames = roleNames.roleNames;
    }
    if (!_.isArray(roleNames)) {
      roleNames = [roleNames];
    }
    var RoleMapping = User.app.models.RoleMapping,
        Role = User.app.models.Role,
        user = this;

    var findPromises = _.map(roleNames, function (roleName) {
      return Role.findOne({
        where: { name: roleName }
      })
      .then(function (result) {
        if (!result) {
          var err = new Error('Unknown "role" name "' + roleName + '".');
          err.statusCode = 404;
          err.code = 'MODEL_NOT_FOUND';
          throw err;
        } else {
          return result;
        }
      });
    });

    return Promise.all(findPromises)
      .then(function (roles) {
        var createPromises = _.map(roles, function (role) {
          var principal = {
            roleId: role.id,
            principalType: RoleMapping.USER,
            principalId: user.id
          };
          return RoleMapping.findOrCreate(
            { where: principal }, // find
            principal  // create
          )
          .then(function (res) {
            return res[0];
          });
        });

        return Promise.all(createPromises);
      })
      .then(function (results) {
        cb(null, results);
        return results;
      })
      .catch(function (err) {
        cb(err);
        throw err;
      });
  };

  User.remoteMethod(
    'addRolesById',
    {
      description: 'Add role to a user',
      accepts: [
        {arg: 'roleNames', type: 'object', http: {source: 'body'}}
      ],
      http: {path: '/roles', verb: 'post'},
      returns: {arg: 'roleMappings', type: 'object'},
      isStatic: false
    }
  );

  // add delete role method to User
  User.prototype.deleteRoleById = function (roleName, cb) {
    cb = cb || utils.createPromiseCallback();
    var RoleMapping = User.app.models.RoleMapping,
        Role = User.app.models.Role,
        user = this;
    return Role.findOne({
      where: { name: roleName }
    })
    .then(function (role) {
      if (!role) {
        var err = new Error('Unknown "role" name "' + roleName + '".');
        err.statusCode = 404;
        err.code = 'MODEL_NOT_FOUND';
        throw err;
      } else {
        return role;
      }
    })
    .then(function (role) {
      var principal = {
        roleId: role.id,
        principalType: RoleMapping.USER,
        principalId: user.id
      };
      return RoleMapping.destroyAll(principal);
    })
    .then(function (result) {
      cb(null, result);
      return result;
    })
    .catch(function (err) {
      cb(err);
      throw err;
    });

  };

  User.remoteMethod(
    'deleteRoleById',
    {
      description: 'Delete role of a user',
      accepts: [
        {arg: 'roleName', type: 'string', required: true}
      ],
      http: {path: '/roles/:roleName', verb: 'delete'},
      returns: {root: true, type: 'object'},
      isStatic: false
    }
  );

};
