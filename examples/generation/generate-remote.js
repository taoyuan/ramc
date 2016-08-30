"use strict";

var fs = require('fs');
var path = require('path');
var ramc = require('../../');

ramc.generate({
  spec: 'http://petstore.swagger.io/v2/swagger.json'
}).then(files => {
  fs.writeFileSync(files[0].path, files[0].data);
});

