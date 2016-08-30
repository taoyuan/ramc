"use strict";

var _ = require('lodash');
var utils = require('../utils');

exports.accept = function (opts) {
  var version = opts && opts.spec && (opts.spec.swagger || opts.spec.swaggerVersion);
  return utils.satisfies(version, '1.x');
};

exports.parse = function (opts) {
  var spec = opts.spec;
  var type = opts.type || 'js';
  var data = {
    isNode: type === 'node',
    isJs: type === 'node' || type === 'js' || type === 'javascript',
    version: spec.apiVersion,
    title: spec.title,
    description: spec.description,
    moduleName: opts.moduleName,
    serviceName: opts.serviceName,
    domain: spec.basePath ? spec.basePath : '',
    baseUrl: spec.basePath ? spec.basePath : '',
    services: [],
    models: []
  };

  var services = {};
  spec.apis.forEach(function (api) {
    api.operations.forEach(function (op) {

      var serviceName = (op.tags && op.tags[0]) || opts.serviceName || 'API';
      var service = services[serviceName];
      if (!service) {
        service = services[serviceName] = {
          name: serviceName,
          serviceName: serviceName,
          methods: []
        };
        data.services.push(service);
      }

      var methodName = op.nickname;
      if (_.startsWith(methodName, serviceName + '.')) {
        methodName = methodName.substr(serviceName.length + 1);
      }

      var method = {
        path: api.path,
        serviceName: opts.serviceName,
        methodName: methodName,
        method: op.method,
        isGET: op.method === 'GET',
        summary: op.summary,
        hasOptionalParameter: false,
        parameters: op.parameters,
        headers: []
      };

      var produces = op.produces || spec.produces;
      if (produces) {
        method.accepts = produces;
        var headers = [];
        headers.value = [];

        headers.name = 'Accept';
        headers.value.push(produces.map(function (value) {
          return '\'' + value + '\'';
        }).join(', '));

        method.headers.push(headers);
      }

      var consumes = op.consumes || spec.consumes;
      if (consumes) {
        method.contentTypes = consumes;
        method.headers.push({name: 'Content-Type', value: '\'' + consumes + '\''});
      }

      op.parameters = op.parameters ? op.parameters : [];
      op.parameters.forEach(function (parameter) {
        parameter.camelCaseName = _.camelCase(parameter.name);
        if (parameter.enum && parameter.enum.length === 1) {
          parameter.isSingleton = true;
          parameter.singleton = parameter.enum[0];
        }
        if (parameter.paramType === 'body') {
          parameter.isBodyParameter = true;
        } else if (parameter.paramType === 'path') {
          parameter.isPathParameter = true;
        } else if (parameter.paramType === 'query') {
          if (parameter['x-name-pattern']) {
            parameter.isPatternType = true;
            parameter.pattern = parameter['x-name-pattern'];
          }
          parameter.isQueryParameter = true;
        } else if (parameter.paramType === 'header') {
          parameter.isHeaderParameter = true;
        } else if (parameter.paramType === 'form') {
          parameter.isFormParameter = true;
        }
        if (!parameter.required) {
          method.hasOptionalParameter = true;
        }
      });
      service.methods.push(method);
    });
  });


  // models
  _.forEach(spec.models, function (definition, name) {

    var model = _.cloneDeep(definition);
    model.name = name;
    model.modelName = name;
    model.properties = [];

    _.forEach(definition.properties, function (prop, name) {
      prop.name = prop.name || name;
      prop.camelCaseName = _.camelCase(prop.name);
      prop.type = _.capitalize(prop.type);

      model.properties.push(prop);
    });

    data.models.push(model);
  });

  return data;
};
