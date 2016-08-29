"use strict";

var _ = require('lodash');
var semver = require('semver');

exports.normalizeName = function normalizeName(id) {
  return id.replace(/\.|-|\{|}/g, '_');
};

exports.pathToMethodName = function pathToMethodName(opts, m, path) {
  if (path === '/' || path === '') {
    return m;
  }

  // clean url path for requests ending with '/'
  var cleanPath = path.replace(/\/$/, '');

  var segments = cleanPath.split('/').slice(1);
  segments = _.transform(segments, function (result, segment) {
    if (segment[0] === '{' && segment[segment.length - 1] === '}') {
      segment = 'by' + segment[1].toUpperCase() + segment.substring(2, segment.length - 1);
    }
    result.push(segment);
  });
  var result = _.camelCase(segments.join('-'));
  return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

exports.satisfies = function (version, range) {
  if (!version) {
    return false;
  }

  if (version.split('.').length <= 2) {
    version += '.0';
  }

  return version && semver.satisfies(version, range);
};
