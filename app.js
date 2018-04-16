var express = require('express');
var config = require('./config/config');
var crypto = require('crypto');
var url = require('url');
var log4js = require('log4js');
var wechatValidate = require('./middleware').wechatValidate;
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

    var replyContent = '';
    switch(req.body.xml.MsgType){
        case 'text':
            replyContent = '';
            break;
        case 'voice':
            replyContent = '你发送了语音信息';
            break;
        case 'image':
            replyContent = '你发送了图片信息，链接为' + req.body.xml.PicUrl;
            break;
        case 'location':
            replyContent = util.format('你发送了地理信息，坐标为{X:%s, Y:%s, Label:%s}', req.body.xml.Location_X, req.body.xml.Location_Y, req.body.xml.Label);
            break;
        default:
            replyContent = '其他信息';
            break;
    }
        

    res.set('Content-Type', 'text/xml');
    res.send(o2x({
        '?xml version="1.0" encoding="utf-8"?' : null,
        'xml': {
            'ToUserName': req.body.xml.ToUserName,
            'FromUserName': req.body.xml.FromUserName,
            'CreateTime': Date.now(),
            'MsgType': 'text',
            'Content': replyContent
        }
    }));
});

// var port = global.currConfig.port;
app.set('port', global.currConfig.port || 3000);

app.listen(app.get('port'), () => {
    console.log('Server started on http://localhost:%d', app.get('port'));
});
