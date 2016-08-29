'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');
var beautify = require('js-beautify').js_beautify;
var lint = require('jshint').JSHINT;
var Promise = require('bluebird');

var utils = require('./utils');
var parsers = require('./parsers');

function generate(opts, type) {
  opts = _.assign({
    type: type,
    moduleName: 'Client',
    serviceName: 'API'
  }, opts);

  return resolve(opts)
    .then(parse)
    .then(context => render(context, opts));
}

function resolve(opts) {
  if (!opts.spec) {
    throw new Error('`spec` is required');
  }

  if (typeof opts.spec === 'string') {
    if (_.startsWith(opts.spec, 'file://')) {
      opts.spec = JSON.parse(fs.readFileSync(opts.spec.substr(7), 'UTF-8'));
    } else {
      return new Promise((resolve, reject) => {
        var request = require('request');
        request(opts.spec, (error, response, body) => {
          if (error) return reject(error);
          opts.spec = JSON.parse(body);
          resolve(opts);
        });
      });
    }
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

function render(context, opts) {
  var type = opts.type;
  if (type === 'custom') {
    if (!_.isString(opts.template) && (!_.isObject(opts.template) || !_.isString(opts.template.main))) {
      throw new Error('Unprovided custom template. Please use the following template -> template: { main: "...", ... } or "/template/dir/..."');
    }
  }

  opts.template = opts.template || path.join(__dirname, '..', 'templates', type);

  if (_.isString(opts.template) && !fs.existsSync(opts.template)) {
    throw new Error('Template dir provided is not exist: ' + opts.template);
  }

  if (_.isString(opts.template)) {
    var base = opts.template;
    var files = fs.readdirSync(base);
    opts.template = {};
    files.forEach(function (file) {
      opts.template[path.basename(file, '.hbs')] = fs.readFileSync(path.join(base, file), 'utf-8');
    });
  }

  var handlebars = Handlebars.create();
  _.forEach(opts.template, function (script, name) {
    handlebars.registerPartial(name, script);
  });

  var source = handlebars.compile(opts.template.main)(context);
  var lintOptions = {
    node: type === 'node' || type === 'custom',
    browser: type === 'angular' || type === 'custom',
    undef: true,
    strict: true,
    trailing: true,
    smarttabs: true,
    maxerr: 999
  };
  if (opts.esnext) {
    lintOptions.esnext = true;
  }

  if (type === 'typescript') {
    opts.lint = false;
  }

  if (opts.lint === undefined || opts.lint === true) {
    lint(source, lintOptions);
    lint.errors.forEach(function (error) {
      if (error.code[0] === 'E') {
        throw new Error(error.reason + ' in ' + error.evidence + ' (' + error.code + ')');
      }
    });
  }
  if (opts.beautify === undefined || opts.beautify === true) {
    return beautify(source, {indent_size: 2, max_preserve_newlines: 2});
  } else {
    return source;
  }
}

module.exports = {
  generate: function (type, opts) {
    if (typeof type === 'object') {
      opts = type;
      type = null;
    }
    type = type || 'js';
    return generate(opts, type);
  }
};
