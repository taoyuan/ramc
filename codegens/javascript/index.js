"use strict";

var _ = require('lodash');
var beautify = require('js-beautify').js_beautify;
var lint = require('jshint').JSHINT;

exports.initialize = function (generator) {
  return new JavascriptCodegen(generator);
};

function JavascriptCodegen(generator) {
  this.generator = generator;
  this.opts = generator.opts;
  this.context = generator.context;
  this.templates = generator.loadTemplates(__dirname + '/templates');

  this.init(this.opts, this.context);
}

JavascriptCodegen.prototype.init = function (opts, context) {
  var utils = this.generator.utils;

  if (!this.projectName) {
    this.projectName = opts.projectName;
  }

  if (!this.projectName && context.title) {
    this.projectName = _.kebabCase(utils.sanitizeName(context.title));
  }

  if (!this.projectName) {
    this.projectName = _.kebabCase(utils.sanitizeName(context.moduleName));
  }

};

JavascriptCodegen.prototype.postprocess = function (code) {
  var opts = this.opts;
  var lintOptions = {
    undef: true,
    strict: true,
    trailing: true,
    smarttabs: true,
    maxerr: 999
  };
  if (opts.esnext) {
    lintOptions.esnext = true;
  }

  if (opts.lint === undefined || opts.lint === true) {
    lint(code, lintOptions);
    lint.errors.forEach(function (error) {
      if (error.code[0] === 'E') {
        throw new Error(error.reason + ' in ' + error.evidence + ' (' + error.code + ')');
      }
    });
  }

  if (opts.beautify === undefined || opts.beautify === true) {
    return beautify(code, {indent_size: 2, max_preserve_newlines: 2});
  } else {
    return code;
  }
};

JavascriptCodegen.prototype.generate = function () {
  var code = this.generator.render(this.templates.main, this.templates);
  code = this.postprocess(code);
  return [{
    path: this.projectName + '.js',
    data: code
  }];
};
