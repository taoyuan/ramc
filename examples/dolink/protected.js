"use strict";

var ramc = require('../../');

return ramc.generate({
  host: 'api-beta.dolink.io',
  spec: 'https://api-beta.dolink.io/explorer/swagger.json'
}).then(result => {
  // console.log(result[0].data);
  var client = eval(result[0].data);

  client.auth({accessToken: '78d8d59bb03d5e282871f7da318b9d20'})
  var user = new client.user();

  user.me(function (err, res) {
    if (err) return console.error(err);
    console.log(res.data);
  });
});
