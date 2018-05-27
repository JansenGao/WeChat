var express = require('express');
var config = require('./config/config');
var log4js = require('log4js');
var util = require('util');
var wechat = require('wechat');
var wechat_util = require('./utils/wechat_util');
var mq = require('./utils/rabbitmq_util');
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
    var openid = message.FromUserName;
    var msgType = message.MsgType;

    if(!openid){
        logger.error('用户信息无效');
        return res.reply('用户信息无效');
    }else if(msgType !== 'image'){
        return res.reply('请提交图片到系统，点击"我的"可查看帮助');
    }

    wechat_util.user_valid(message)
    .then(mq.insert_mq)
    .then(
        () => {
	        logger.info('用户表单已提交');
            return res.reply('你的表单已提交。');
        }
    ).catch(
        (err) => {
	        logger.error(err);
            return res.reply(err);
        }
    );
}));

const PORT = config[env].port;
app.listen(PORT, () => {
	console.log('Server started at http://localhost:%d', PORT);
});
