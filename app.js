var express = require('express');
var config = require('./config/config');
var log4js = require('log4js');
var util = require('util');
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

app.listen(80, () => {
	console.log('Server started at http://localhost');
});
