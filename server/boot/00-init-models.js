'use strict';

var log = require('debug')('boot:00-init-datasources');
var path = require('path');
var _ = require('lodash');

module.exports = function(app, done) {

  // whether to clear the data base
  var migrate = !!process.env.INIT;

  function autoMigrateModel(model) {

    log('auto migrating "' + model.modelName + '" in ' + model.dataSource.name);

    return model.dataSource.automigrate(model.modelName);

  }

  function autoUpdateModel(model) {

    log('auto updating "' + model.modelName + '" in ' + model.dataSource.name);

    // check if schema needs to be update
    return new Promise(function (resolve, reject) {
      model.dataSource.isActual(model.modelName, function (err, actual) {
        if (err) {
          reject(err);
        } else {
          if (!actual) { // need update
            resolve(model.dataSource.autoupdate(model));

          } else { // do not need update
            log(model.definition.name + ' is already up to date');
          }
          resolve();
        }
      });
    });

  }

  function initModel(model) {
    if (model.dataSource) {
      return migrate ? autoMigrateModel(model)
        : autoUpdateModel(model);
    }
    return Promise.resolve();
  }

  // create container to storage image
  function configureStorage() {

    log('configuring storage');

    var StorageSource = app.dataSources.storage;

    StorageSource.connector.getFilename = function(file, req, res) {
      var ext = path.extname(file.name);
      var time = new Date().getTime();
      // rename file to '{time}.png'
      return time + ext;
    };

    if (migrate) {

      var Storage = app.models.Storage;

      var destroyContainer = function (name) {

        return new Promise(function (resolve, reject) {
          log('destroy storage container: ' + name);
          Storage.getContainer(name, function (err) {
            if (err) {
              // container not found
              resolve(name);
            } else {
              // container found
              Storage.destroyContainer(name, function (err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(name);
                }
              });
            }
          });
        });
      };

      var createContainer = function (name) {
        return new Promise(function (resolve, reject) {
          log('create storage container: ' + name);
          Storage.createContainer({
            name: 'image'
          }, function (err, container) {
            if (err) {
              reject(err);
            } else {
              resolve(container);
            }
          });
        })
      };

      return destroyContainer('image')
        .then(createContainer);

    } else {
      return Promise.resolve();
    }

  }

  var promises = [];

  app.models().forEach(function (model) {
    promises.push(initModel(model));
  });

  Promise.all(promises)
    .then(configureStorage)
    .then(function() { // finish
      log('done');
      done();
    })
    .catch(function (err) {
      console.error(err.stack);
    });

};
