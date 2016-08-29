"use strict";

var fs = require('fs');
var path = require('path');
var ramc = require('../../');

ramc.generate({
  spec: 'http://petstore.swagger.io/v2/swagger.json'
}).then(code => {
  fs.writeFileSync(path.join(__dirname, 'api-remote.js'), code);
});

