var express = require('express');
var config = require('./config/config');
var log4js = require('log4js');
var util = require('util');
var wechat = require('wechat');
var redis = require('redis');
var logger = require('./utils/logger').logger;
var DB = require('./utils/db_mysql').DB;

app = express();

var env = config.environment;
global.wechatConfig = {
    token: config[env].wechat.token,
    appid: config[env].wechat.appid,
    encodingAESKey: config[env].wechat.aeskey,
    checkSignature: true
};

app.use(express.query());
app.use('/', wechat(global.wechatConfig, function(req, res, next){
    logger.debug('收到请求');
    var message = req.weixin;
    for(var key in message){
        logger.debug('message.%s=%s', key, message[key]);
    }
    var repl_message = '';
    switch(message.MsgType){
        case 'text':
            repl_message = util.format('收到:%s', message.Content);
            break;
        case 'image':
            repl_message = '收到你的图像';
            break;
        case 'voice':
            repl_message = '收到你的音频';
            break;
        case 'video':
            repl_message = '收到你的视频';
            break;
	case 'location':
	    repl_message = '收到你的位置';
	    break;
	case 'link':
	    repl_message = '收到你的链接';
	    break;
        default:
            repl_message = 'Hello';
            break;
    }
    res.reply(repl_message);
}));

const PORT = config[env].port;
app.listen(PORT, () => {
	console.log('Server started at http://localhost:%d', PORT);
});
