var express = require('express');
var config = require('./config/config');
var crypto = require('crypto');
var url = require('url');
var log4js = require('log4js');
var wechatValidate = require('./middleware').wechatValidate;
var util = require('./lib/util');
var o2x = require('object-to-xml');
var bodyParser = require('body-parser');

require('body-parser-xml')(bodyParser);

global.currConfig = config.develop;

var logger = log4js.getLogger();
logger.level = global.currConfig.log_level;

app = express();
app.use(bodyParser.xml());

app.post('*', wechatValidate, (req, res) => {
	const { method, url} = req;
	logger.debug('method=%s', method);
	logger.debug('url=%s', url);
	for(var key in req.body){
		logger.debug(req.body[key]);
    }

    res.set('Content-Type', 'text/xml');
    res.send(o2x({
        '?xml version="1.0" encoding="utf-8"?' : null,
        'xml': {
            'ToUserName': req.body.xml.ToUserName,
            'FromUserName': req.body.xml.FromUserName,
            'CreateTime': Date.now(),
            'MsgType': 'text',
            'Content': req.body
        }
    }));
});

// var port = global.currConfig.port;
app.set('port', global.currConfig.port || 3000);

app.listen(app.get('port'), () => {
    console.log('Server started on http://localhost:%d', app.get('port'));
});
