const redis = require('redis');
var logger = require('./logger').logger;
const https = require('https');
const config = require('../config/config');

var env = config.environment;
const redis_host = config[env].redis.host;
const redis_port = config[env].redis.port;
const client = redis.createClient(redis_port, redis_host);

/*
    返回一个Promise对象，用then((token) => {})获取access_token
*/
exports.cache_access_token = function(app_id, app_secret){
    var that = this;
    return new Promise(function(resolve, reject){
        key = "access_token_" + app_id;
        access_token = '';
        client.get(key, (err, access_token) => {
            if(err){
                return reject(err);
            }
            if(access_token){
                return resolve(access_token);
            }else{
                console.log('Token not found in Redis, use https to get.')
                var URL = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential';
                URL += '&appid=' + app_id;
                URL += '&secret=' + app_secret;

                https.get(URL, res => {
                    var buffers = [];
                    res.on('data', chunk => {
                        buffers.push(chunk);
                    });

                    res.on('end', chunk => {
                        var whole = Buffer.concat(buffers);
                        var dataStr = whole.toString('utf8');
                        data = JSON.parse(dataStr);
                        access_token = data.access_token;
                        client.set(key, access_token, 'EX',  data.expires_in, (err, reply) => {
                            if(err){
                                return reject(err);
                            }else{
                                console.log('Token saved in Redis.')
                                return resolve(access_token);
                            }
                        });
                    });
                }).on('err', (err) => {
                    return reject(err);
                });
            }
        });
    });
}
