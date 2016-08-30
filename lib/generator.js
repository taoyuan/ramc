"use strict";

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');

module.exports = Generator;

/**
 *
 * @param opts
 * @param context
 * @returns {Generator}
 * @constructor
 */
function Generator(opts, context) {
  if (!(this instanceof Generator)) {
    return new Generator(opts, context);
  }

  this.opts = opts;
  this.context = context;

  this.utils = require('./utils');
}

Generator.prototype.loadTemplates = function (dir) {
  var templates = {};
  fs.readdirSync(dir)
    .filter(function (file) {
      return path.extname(file) === '.hbs';
    })
    .forEach(function (file) {
      templates[path.basename(file, '.hbs')] = fs.readFileSync(path.join(dir, file), 'utf-8');
    });
  return templates;
};

Generator.prototype.render = function (template, partials) {
  var handlebars = Handlebars.create();

  _.forEach(partials, function (script, name) {
    handlebars.registerPartial(name, script);
  });

  return handlebars.compile(template)(this.context);
};


Generator.prototype.generate = function (codegen) {

};

