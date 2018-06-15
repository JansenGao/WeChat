var config = require('./config');

module.exports = {
    token: config.wechat.token,
    appid: config.wechat.appid,
    encodingAESKey: config.wechat.aeskey,
    checkSignature: true,
    secret: config.wechat.appsecret
};
