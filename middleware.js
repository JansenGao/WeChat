var log4js = require('log4js');
const config = require('./config/config');
const crypto = require('crypto');
const utils = require('./lib/utils');

/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
exports.wechatValidate = function(req, res, next) {
    
    // 1. 获取请求参数
    var signature = req.query.signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;

    // 2. 将token,timestamp,nonce三个参数按字典排序
    var array = [global.currConfig.wechat.token, timestamp, nonce];
    // console.log('array=%s', array);
    array.sort();

    // 3. 将三个参数字符串拼接成一个字符串并进行SHA1加密
    var tmpStr = array.join('');
    const hashCode = crypto.createHash('sha1');
    var result = hashCode.update(tmpStr, 'utf8').digest('hex');

    console.log('result=%s', result);
    // 4. 将加密后字符串与signature对比
    if(result == signature){
        next();
    }else{
        return utils.resError(res, '验证失败');
    }
}
