var express = require('express');
var config = require('../config/config'); 
var requestHandlers = require("./requestHandlers");
var app = express();

var port = config[env].rpa.port;

app.get('/rpa/imageList', function (req, res) {
  //res.send('Got an imageList request');
  requestHandlers.imageList(req, res);
});

app.post('/rpa/result', function (req, res) {
    requestHandlers.result(req, res);
  });

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
