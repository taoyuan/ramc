'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var events = require('events');

var ramc = require('../lib/ramc');

describe('Test with promise', function () {
    this.timeout(10000);

    var api;

    before(function () {
      /*jshint evil:true*/
      return ramc.generate({
        spec: path.resolve('tests/apis/heroku-pet.json')
      }).then(result => {
        var client = eval(result[0].data);
        client.Promise = require('bluebird');
        api = client.api;
      });
    });

    it('Should have authenticate method', () => {
      return api.get({limit: 2}).then(res => {
        assert.lengthOf(res.data, 2);
        // console.log(res.data);
      });
    });

});
