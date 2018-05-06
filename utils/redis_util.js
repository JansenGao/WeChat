const redis = require('redis');
var logger = require('./logger').logger;
const https = require('https');

exports.cache_access_token = function(app_id, app_secret){
    var client = redis.createClient();

    key = "access_token_" + app_id;

    client.get(key, function(err, reply){
        if(err){
            logger.error('Redis connection failed.');
        }else{
            if(reply){
                return reply;
            }else{
                var URL = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential';
                URL += '&appid=' + app_id;
                URL += '&secrect=' + app_secret;

                https.get(URL, res => {
                    var token = res.token;
                    var expire_second = res.expires_in;
                    console.log(token);
                    console.log(expire_second);
                });
            }
        }
    });
};
