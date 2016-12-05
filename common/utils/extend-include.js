'use strict';

var _ = require('lodash');

module.exports = function (include) {
  if (!include) return [];
  if (!_.isArray(include)) {
    include = [include];
  }
  include = include.map(function (item) {
    if (_.isString(item)) {
      return {
        relation: item
      };
    } else {
      return item;
    }
  });
  return include;
};
