const redis = require('redis');
var logger = require('./logger').logger;
const https = require('https');
const config = require('../config/config');
const Bluebird = require('bluebird');

var env = config.environment;
const redis_host = config[env].redis.host;
const redis_port = config[env].redis.port;
const client = redis.createClient(redis_port, redis_host);

clientPromise = new Bluebird(((resolve, reject) => {
    client.get('access_token_wxf22daa784d9b9b02', (err, reply) => {
        resolve(reply);
    });
}));

function cache_access_token(app_id, app_secret){
    key = "access_token_" + app_id;

    return client.get(key, function(err, reply){
        if(err){
            logger.error('Redis connection failed.');
            return null;
        }else{
            if(reply){
                console.log('Has cache: %s', reply);
                return reply;
            }else{
                console.log('Has no cache');
                var URL = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential';
                URL += '&appid=' + app_id;
                URL += '&secret=' + app_secret;
                console.log(URL);

                value = '';

                https.get(URL, res => {
                    var buffers = [];
                    console.log(res.statusCode);
                    res.on('data', chunk => {
                        // console.log(chunk);
                        buffers.push(chunk);
                    });

                    res.on('end', chunk => {
                        var whole = Buffer.concat(buffers);
                        var dataStr = whole.toString('utf8');
                        console.log(dataStr);
                        data = JSON.parse(dataStr);
                        value = data.access_token;
                        client.set(key, data.access_token, 'EX',  data.expires_in, (err, reply) => {
                            if(err){
                                console.log(err);
                            }
                        });
                    });
                }).on('err', err => {
                    console.log(err);
                }).on('end', {

                });
                return value;
            }
        }
    });
}

exports.cache_access_token = cache_access_token;
