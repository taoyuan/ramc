"use strict";

var fs = require('fs');
var path = require('path');
var ramc = require('../../');

ramc.generate({
  // host: 'api-beta.dolink.io',
  spec: 'file://' + path.join(__dirname, '..', 'apis', 'heroku-pet.json')
}).then(code => {
  fs.writeFileSync(path.join(__dirname, 'api-local.js'), code);
});

