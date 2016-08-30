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
      ramc.generate({
        moduleName: 'Test',
        host: 'api.com',
        spec: file
      }).then(function (result) {
        assert(result.length);
        assert(typeof(result[0].data), 'string');
      });
    });
  });
});
