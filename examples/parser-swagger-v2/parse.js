"use strict";

var fs = require('fs');
var SwaggerV2 = require('../../lib/parsers').SwaggerV2;

var file = '../apis/uber.json';
var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
var data = SwaggerV2.parse({
  spec: swagger
});

console.log(JSON.stringify(data, null, '  '));
