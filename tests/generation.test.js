'use strict';

var assert = require('assert');
var fs = require('fs');
var ffs = require('final-fs');

var ramc = require('../lib/ramc');

describe('Test Generation', function () {
  var list = ffs.readdirSync('tests/apis');
  list.forEach(function (file) {
    file = 'tests/apis/' + file;
    it(file, function () {
      var result = ramc.generate({
        moduleName: 'Test',
        host: 'api.com',
        specFile: file
      });
      assert(typeof(result), 'string');
    });
  });
});
