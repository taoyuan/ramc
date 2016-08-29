'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var events = require('events');

var ramc = require('../lib/ramc');

function createClient() {
  return ramc.generate({
    moduleName: 'Auth',
    specFile: path.resolve('tests/apis/protected.json')
  }).then(code => {
    return eval(code);
  });
}

describe('Test Protected', function () {
  describe('Test Automatic Auth Token Assignment', function () {
    this.timeout(10000);

    it('Should have auth and getSecure methods', () => {
      createClient().then(client => {
        var api = new client.API();
        assert.typeOf(api.auth, 'function');
        assert.typeOf(api.getSecure, 'function');
      });
    });

    describe('Calling auth method with correct password', () => {

      var data;

      before((done) => {
        createClient().then(client => {
          var api = new client.API();
          api.auth('client_credentials', {
            email: 'w+test@28.io',
            password: 'foobar'
          }, (error, result) => {
            assert.equal(result.body.token_type, 'bearer');
            data = result.body;
            done();
          });
        });
      });

      it('Should have good response for calling operation with good token', (done) => {
        createClient().then(client => {
          client.auth({
            in: 'query',
            name: 'token',
            accessToken: data.access_token
          });
          var api = new client.API();
          api.getSecure((error, result) => {
            assert.equal(result.statusCode, 200);
            done();
          });
        });
      });

      it('Should have unauthorized response for calling operation with wrong token', (done) => {
        createClient().then(client => {
          client.auth({
            in: 'query',
            name: 'token',
            accessToken: data.access_token.slice(1)
          });
          var api = new client.API();
          api.getSecure((error, res) => {
            assert.equal(error.response.statusCode, 401);
            assert.equal(res.data, undefined);
            done();
          });
        });
      });

      it('Should have good response for overriding bad token with good one on the operation call', (done) => {
        createClient().then(client => {
          client.auth({
            in: 'query',
            name: 'token',
            accessToken: data.access_token.slice(1)
          });
          var api = new client.API();
          api.getSecure({token: data.access_token}, (error, res) => {
            assert.equal(res.statusCode, 200);
            done();
          });
        });
      });

      it('Should have unauthorized response for overriding good token with bad one on the operation call', (done) => {
        createClient().then(client => {
          client.auth({
            in: 'query',
            name: 'token',
            accessToken: data.access_token
          });
          var api = new client.API();
          api.getSecure({token: data.access_token.slice(1)}, (error, res) => {
            assert.equal(error.response.statusCode, 401);
            assert.equal(res.data, undefined);
            done();
          });
        });
      });

    });
  });
});
