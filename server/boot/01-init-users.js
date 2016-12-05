'use strict';

var log = require('debug')('boot:01-init-users');
var _ = require('lodash');

module.exports = function(app, done) {
  var User = app.models.user,
    Role = app.models.Role,
    RoleMapping = app.models.RoleMapping;

  function createDefaultRoleAndUsers() {

    log('creating default users');

    var users = [
      {
        realm: 'admin',
        username: 'admin',
        email: 'admin@admin.com',
        password: 'admin',
        roles: ['admin']
      }
    ];

    var createdUsers = {};
    var createdRoles = {};

    var createAllUsers = function () {
      log('creating users');
      var filter = function (user) {
        user = _.omit(user, 'roles');
        return createUser(user)
          .then(function (createdUser) {
            createdUsers[user.username] = createdUser;
          });
      };
      return Promise.all(
        _.map(users, filter)
      );
    };

    var createAllRoles = function () {
      log('creating roles');
      var filter = function (roleName) {
        return createRole(roleName)
          .then(function (role) {
            createdRoles[roleName] = role;
          });
      };
      var roles = _.map(users, 'roles');
      roles = _.uniq(_.flatten(roles));

      return Promise.all(
        _.map(roles, filter)
      );
    };

    var createAllPrincipal = function () {
      log('creating principals');
      var filter = function (user) {
        return Promise.all(_.map(user.roles, function (roleName) {
          return createPrincipal(createdRoles[roleName], createdUsers[user.username]);
        }));
      };
      return Promise.all(
        _.map(users, filter)
      );
    };

    return createAllUsers()
      .then(createAllRoles)
      .then(createAllPrincipal);

  }

  function createRole(roleName) {
    return Role.findOrCreate(
      { where: { name: roleName } }, // find
      { name: roleName } // create
      )
      .then(function (res) {
        var createdRole = res[0], created = res[1];
        if (created) {
          log('creating role: ' + roleName);
        } else {
          log('found role: ' + roleName);
        }
        return createdRole;
      });

  }

  function createUser(user) {
    return User.findOrCreate(
      { where: { username: user.username }}, // find
      user // create
      )
      .then(function (res) {
        var createdUser = res[0], created = res[1];
        if (created) {
          log('creating user: ' + user.username);
        } else {
          log('found user: ' + user.username);
        }
        return createdUser;
      });

  }

  function createPrincipal(role, user) {

    var principal = {
      roleId: role.id,
      principalType: RoleMapping.USER,
      principalId: user.id
    };

    return RoleMapping.findOrCreate(
      { where: principal }, // find
      principal // create
      )
      .then(function (res) {
        var createdPrincipal = res[0], created = res[1];
        if (created) {
          log('creating principal: ' + user.username + ' => ' + role.name);
        } else {
          log('found principal: ' + user.username + ' => ' + role.name);
        }
        return createdPrincipal;
      });

  }


  createDefaultRoleAndUsers()
    .then(function () {
      log('done');
      done();
    })
    .catch(console.error);

};
