var wechat = require('wechat');
var config = require('../lib/config');
var wechat_config = require('../lib/wechat_config');
var logger = require('./utils/logger').logger;
var wechat_util = require('./utils/wechat_util');
var wechatOauth = require('wechat-oauth');

var client = new wechatOauth(wechat_config.appid, wechat_config.secret);

exports.autoReply = wechat(wechat_config, function(req, res, next){
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

    wechat_util
    .user_valid(message) // 判断用户是否存在
    .then(wechat_util.insert_in_msg_mq) // 如果存在，将消息插入队列，然后回复
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
});

exports.middleware_login_wechat = function(req, res, next){
    
}
