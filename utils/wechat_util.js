const wechat = require('wechat');
const redis = require('./redis_util');
const config = require('../config/config');
const https = require('https');
const urlUtil = require('url');

const config_env = config[config['environment']];

/*
    参数：
        menu_obj对象（参考：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141013)
    返回值：
        Promise对象，根据then()的结果获取微信是否接受该菜单。
            update成功，返回{"errcode":0,"errmsg":"ok"}
*/
exports.update_menu = function(menu_obj){
    return new Promise((resolve, reject) => {
        menu_str = JSON.stringify(menu_obj);
        var appid = config_env.wechat.appid;
        var appsecret = config_env.wechat.appsecret;
        redis.cache_access_token(appid, appsecret).then((access_token) => {
            var url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + access_token;
            var urlData = urlUtil.parse(url);

            var options = {
                hostname: urlData.hostname,
                path: urlData.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(menu_str,'utf-8')
                }
            }
            var req = https.request(options, res => {
                var buffer = [], result = '';
                res.on('data', data => {
                    buffer.push(data);
                });
                res.on('end', () => {
                    result = Buffer.concat(buffer).toString('utf-8');
                    resolve(result);
                });
            }).on('error', err => {
                reject(err);
            });

            req.write(menu_str);
            req.end();
        }).catch(err => {
            reject(err);
        });
    });
};
