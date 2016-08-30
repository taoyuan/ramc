'use strict';

var _ = require('lodash');
var fs = require('fs-extra-promise');
var path = require('path');
var Promise = require('bluebird');

var utils = require('./utils');
var parsers = require('./parsers');
var Generator = require('./generator');

function resolve(opts) {
  if (!opts.spec) {
    return Promise.reject(new Error('`spec` is required'));
  }

  if (typeof opts.spec === 'string') {
    var url = opts.spec;
    if (_.includes(url, '://') && !_.startsWith(url, 'file://')) {
      // load spec from url
      return new Promise((resolve, reject) => {
        var request = require('request');
        request(url, (error, response, body) => {
          if (error) return reject(error);
          opts.spec = JSON.parse(body);
          resolve(opts);
        });
      });
    }

    if (_.startsWith(url, 'file://')) {
      url = url.substr(7);
    }

    opts.spec = JSON.parse(fs.readFileSync(url, 'UTF-8'));
  }

  return Promise.resolve(opts);
}

function parse(opts) {
  // For Swagger Specification version 2.0 value of field 'swagger' must be a string '2.0'
  var parser = _.find(parsers, function (parser) {
    return parser.accept(opts);
  });

  if (!parser) {
    throw new Error('Can not find suitable parser');
  }

  return parser.parse(opts);
}

function generate(opts) {
  return function (context) {
    var generator = new Generator(opts, context);

    var codegen;
    try {
      codegen = require('../codegens/' + opts.type);
    } catch (e) {
      return Promise.reject(e);
    }

    codegen = codegen.initialize(generator);

    if (codegen && codegen.generate) {
      return codegen.generate();
    } else {
      return generator.generate(codegen);
    }
  }
}

function persist(opts) {
  return function (files) {
    if (opts.output) {
      return fs.ensureDirAsync(opts.output).then(function () {
        files.forEach(function (file) {
          fs.writeFileSync(path.join(opts.output, file.path), file.data, 'utf-8');
        });
      }).then(function () {
        return files;
      });
    }
    return files;
  }
}

exports.generate = function (opts) {
  opts = _.assign({
    moduleName: 'Client',
    serviceName: 'API'
  }, opts);

  opts.type = opts.lang || opts.type || 'javascript';

  return resolve(opts)
    .then(parse)
    .then(generate(opts))
    .then(persist(opts));
};
