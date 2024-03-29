'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var events = require('events');

var ramc = require('../lib/ramc');

describe('Test Generated API', function () {
  describe('Test Generated code for the 28.io Auth API', function () {
    this.timeout(10000);

    var api;

    before(function () {
      /*jshint evil:true*/
      return ramc.generate({
        spec: path.resolve('tests/apis/auth.json')
      }).then(result => {
        var client = eval(result[0].data);
        client.configure('http://portal.28.io/api');
        api = client.api;
      });
    });

    it('Should have authenticate method', () => {
      assert.typeOf(api.authenticate, 'function');
    });

    it('Should have missing parameter error for calling authenticate method with missing parameters', () => {
      assert.throws(() => {
        api.authenticate(null, {
          email: 'w+test@28.io'
        });
      }, /Missing the required parameter/);
    });

    it('Should have invalid password for calling authenticate method with wrong password', (done) => {
      api.authenticate('client_credentials', {
        email: 'w+test@28.io',
        password: 'foobartest'
      }, (error) => {
        assert.equal(
          error.response.body.message.substring(0, '[errors:wrong-password]'.length),
          '[errors:wrong-password]'
        );
        done();
      })
    });

    it('Should have valid password for calling authenticate method with correct password', (done) => {
      api.authenticate('client_credentials', {
        email: 'w+test@28.io',
        password: 'foobar',
      }, (error, result) => {
        if (error) return done(error);
        assert.equal(result.body.token_type, 'bearer');
        done();
      });
    });
  });
});
