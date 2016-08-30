"use strict";

var fs = require('fs');
var path = require('path');
var ramc = require('../../');

ramc.generate({
  // host: 'api-beta.dolink.io',
  spec: 'file://' + path.join(__dirname, '..', 'apis', 'heroku-pet.json')
}).then(files => {
  fs.writeFileSync(files[0].path, files[0].data);
});

