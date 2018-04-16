var express = require('express');
var config = require('./config/config');
var crypto = require('crypto');
var url = require('url');
var log4js = require('log4js');
var wechatValidate = require('./middleware').wechatValidate;
var o2x = require('object-to-xml');
var bodyParser = require('body-parser');

var wechat = require('wechat');

app = express();

var env = "develop";
global.wechatConfig = {
    token: config[env].wechat.token,
    appid: config[env].wechat.appid,
    encodingAESKey: config[env].wechat.aeskey,
    checkSignature: true
};

global.logger = log4js.getLogger();
global.logger.level = config[env].log_level;

app.use(express.query());
app.use('/wechat', wechat(global.wechatConfig, function(req, res, next){
    global.logger.debug('收到请求');
    var message = req.weixin;
    for(var key in message){
        global.logger.debug('message.%s=%s', key, message[key]);
    }
	res.reply('Hello');
}));

app.listen(80, () => {
	console.log('Server started at http://localhost');
});
