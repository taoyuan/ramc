"use strict";

var fs = require('fs');
var path = require('path');


var file = path.join(__dirname, 'swagger.json');
var data = JSON.parse(fs.readFileSync(file, 'UTF-8'));
//
var SwaggerClient = require('swagger-client');
var client = new SwaggerClient({
  usePromise: true,
  spec: data
}).then(function (client) {
  console.log(client);
});
// client.buildFromSpec(data);
// console.log(client.swaggerObject);


// var SwaggerSpecConverter = require('swagger-client/lib/spec-converter');
// var converter = new SwaggerSpecConverter();
// converter.convert(data, [], {}, function(spec) {
//   // self.swaggerObject = spec;
//   // new Resolver().resolve(spec, self.url, self.buildFromSpec, self);
//   // self.isValid = true;
//
//   console.log(spec);
// });
